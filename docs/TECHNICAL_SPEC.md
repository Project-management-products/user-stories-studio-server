# TECHNICAL_SPEC.md

## 1. Visión General
Este documento define las especificaciones técnicas para el **User Stories Studio Server**. El servidor actúa como un **API Gateway agnóstico**, normalizando la comunicación entre el frontend y múltiples proveedores de Inteligencia Artificial (Google Gemini, Anthropic Claude, etc.).

---

## 2. API Contract (Contrato de Interfaz)

### 2.1. Endpoint Unificado
El servidor expondrá un único endpoint para la generación de contenido.

* **Ruta:** `POST /api/generate-user-story`
* **Content-Type:** `application/json`

#### Esquema de Solicitud (Request)
```json
{
  "prompt": "Generar historia para login de usuarios",
  "context": "Es una app fintech segura",
  "model_id": "gemini-2.5-flash" // Opcional. Si se omite, usa el default del proveedor activo.
}
```

#### Esquema de Respuesta Normalizada (Response)
Independientemente del proveedor (Google/Anthropic), el backend **siempre** devolverá esta estructura:

```json
{
  "story_text": "Como usuario fintech, quiero iniciar sesión con biometría...",
  "acceptance_criteria": [
    "Dado que el usuario abre la app, Cuando usa FaceID...",
    "Dado que falla la biometría, Entonces pide PIN..."
  ],
  "suggestions": [
    "Considerar bloqueo tras 3 intentos fallidos.",
    "Agregar autenticación de dos factores (2FA)."
  ],
  "metadata": {
    "provider": "google",
    "model": "gemini-2.5-flash",
    "latency_ms": 1200
  }
}
```

### 2.2. Documentación (Swagger/OpenAPI)
* **Ruta:** `/api-docs`
* **Implementación:** `swagger-ui-express` + `swagger-jsdoc`.
* **Requisito:** Debe permitir probar el endpoint `/api/generate-user-story` directamente desde la interfaz web.

---

## 3. Arquitectura de Persistencia y Configuración

El sistema utiliza un enfoque híbrido: **Variables de Entorno** para secretos y **Archivos JSON** para configuración operativa dinámica.

### 3.1. Ubicación
* **Directorio:** `./storage-json/`, se debe crear si no existe al intentar accederlo.
* **Gitignore:** Este directorio (excepto plantillas de ejemplo) debe ser ignorado por git si contiene datos de producción, aunque se recomienda commitear la configuración base.

### 3.2. Estructura de Archivos

#### A. `server_config.json` (Configuración Operativa)
Controla el comportamiento del servidor y la seguridad de red.

```json
{
  "active_ia_provider": "google",
  "active_ia_model": "gemini-2.5-flash",
  "allowed_origins": [
    "http://localhost:3000",
    "https://mi-user-stories-studio.com"
  ],
  "persistence_enabled": true,
  "request_timeout_ms": 30000
}
```

#### B. `providers.json` (Catálogo de Modelos)
Define los modelos disponibles y mapea las credenciales (referencias).

```json
{
  "google": {
    "enabled": true,
    "env_key_ref": "GOOGLE_API_KEY",
    "base_url": "[https://generativelanguage.googleapis.com/v1beta](https://generativelanguage.googleapis.com/v1beta)",
    "default_model": "gemini-2.5-flash",
    "models": [
      { "id": "gemini-2.5-flash", "context_window": 1000000 },
      { "id": "gemini-3-flash", "context_window": 2000000 }
    ]
  },
  "anthropic": {
    "enabled": true,
    "env_key_ref": "ANTHROPIC_API_KEY",
    "base_url": "[https://api.anthropic.com/v1](https://api.anthropic.com/v1)",
    "default_model": "claude-sonnet-4-20250514",
    "models": [
      { "id": "claude-sonnet-4-20250514", "context_window": 200000 }
    ]
  }
}
```

### 3.3. Lógica de Carga de Configuración
1.  **Inicio:** El servidor busca `storage-json/server_config.json`.
2.  **Fallback:** Si el archivo no existe o es ilegible, carga valores por defecto desde `.env` o manejar con un handle de error .
3.  **Validación:** Se debe validar que `active_provider` exista en `providers.json`.

---

## 4. Estrategia de Seguridad

### 4.1. Gestión de Secretos (API Keys)
* **Regla de Oro:** NUNCA almacenar API Keys reales en los archivos JSON.
* **Mecanismo:**
    1.  `providers.json` contiene `"env_key_ref": "GOOGLE_API_KEY"`.
    2.  El servidor lee `process.env.GOOGLE_API_KEY`.
    3.  El servidor inyecta la key en el header `x-goog-api-key` (o `x-api-key` para Anthropic) al momento de hacer la petición externa.

### 4.2. CORS (Cross-Origin Resource Sharing)
Middleware estricto que valida el header `Origin` contra el array `allowed_origins` definido en `server_config.json`.
* **Si coincide:** `Access-Control-Allow-Origin: <origin>`
* **Si no coincide:** Retornar `403 Forbidden` inmediatamente.

---

## 5. Patrón de Adaptadores (Adapter Pattern)

Para cumplir con la "Normalización de Respuestas", se debe implementar una interfaz común.

### 5.1. Interfaz TypeScript (Ejemplo)
```typescript
interface AIAdapter {
  generate(prompt: string, context: string, model: string): Promise<NormalizedResponse>;
}
```

### 5.2. Mapeo de Respuestas

| Proveedor | Campo Original (Raw) | Campo Normalizado (Target) |
| :--- | :--- | :--- |
| **Google Gemini** | `response.candidates[0].content.parts[0].text` | `story_text` |
| **Anthropic Claude** | `response.content[0].text` | `story_text` |
| **OpenAI (Futuro)** | `response.choices[0].message.content` | `story_text` |

*Nota: El backend debe realizar un parseo inteligente del texto recibido para extraer `acceptance_criteria` y `suggestions` si el LLM devuelve todo en un solo bloque de texto, o usar "Function Calling" / "JSON Mode" de los proveedores para forzar la estructura.*

---

## 6. Manejo de Errores Estandarizado

El servidor debe interceptar errores externos y traducirlos a códigos HTTP propios.

| Error del Proveedor | Causa Probable | Respuesta del Servidor (Backend -> Frontend) |
| :--- | :--- | :--- |
| **401 Unauthorized** | API Key inválida en `.env` | **500 Internal Server Error** (Log: "Provider Auth Failed") |
| **429 Too Many Requests** | Cuota excedida / Rate Limit | **429 Too Many Requests** (Con header `Retry-After`) |
| **500 / 503** | Proveedor caído (Downtime) | **502 Bad Gateway** |
| **JSON Parse Error** | El modelo alucinó el formato | **422 Unprocessable Entity** (Mensaje: "AI format error") |

---

## 7. Stack Tecnológico Sugerido
* **Runtime:** Node.js (v18+).
* **Framework:** Express.js o Fastify.
* **Validación:** Joi o Zod (para validar los JSON de configuración y requests).
* **HTTP Client:** Axios o Fetch nativo.
* **Documentación:** Swagger UI Express.
* **Logs:** Winston o Pino (para auditoría de requests persistentes).
