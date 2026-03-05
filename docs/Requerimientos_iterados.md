### Historias de Usuario

---

**Historia de Usuario 1: Interacción con el Generador de Historias de Usuario**

*   **Formato:** Como Business Analyst o Product Owner, quiero enviar un nombre de projecto, objetivo, usuario, contexto y requerimiento al servidor para generar o refinar historias de usuario para obtener sugerencias y formatos consistentes sin preocuparme por el proveedor de IA subyacente.

*   **Criterios de Aceptación:**
    *   **Escenario 1: Solicitud exitosa al endpoint unificado.**
        *   **Dado** que el servidor está configurado con un proveedor de IA activo (ej. Google IA con gemini-2.5-flash) y un prompt válido,
        *   **Cuando** el Business Analyst envía una solicitud HTTP POST al endpoint unificado `/api/generate-user-story` con el prompt en el cuerpo de la solicitud,
        *   **Entonces** el servidor debe enrutar la solicitud al proveedor de IA configurado, procesar la respuesta y devolverla al Business Analyst en un formato JSON estandarizado.
    *   **Escenario 2: Contrato de respuesta estandarizado.**
        *   **Dado** que el servidor ha procesado una solicitud de generación de historia de usuario,
        *   **Cuando** el Business Analyst recibe la respuesta del endpoint unificado,
        *   **Entonces** la respuesta debe adherirse a un contrato JSON predefinido que incluya campos como `story_text`, `acceptance_criteria`, y `suggestions`, independientemente del proveedor de IA subyacente.
    *   **Escenario 3: Manejo de errores.**
        *   **Dado** que el servidor está configurado con un proveedor de IA activo,
        *   **Cuando** el proveedor de IA subyacente devuelve un error o no responde,
        *   **Entonces** el servidor debe capturar el error, registrarlo y devolver una respuesta de error estandarizada (ej. HTTP 500) al Business Analyst con un mensaje descriptivo.

**Historia de Usuario 2: Configuración de Proveedores y Modelos de IA**

*   **Formato:** Como Administrador del sistema, quiero configurar el proveedor de IA activo y el modelo LLM asociado mediante variables de configuración para permitir que el sistema utilice diferentes motores de IA según las necesidades.

*   **Criterios de Aceptación:**
    *   **Escenario 1: Cambio de proveedor de IA.**
        *   **Dado** que el servidor está en ejecución y configurado inicialmente con Google IA,
        *   **Cuando** un Administrador del sistema actualiza la variable de configuración `active_provider` de `GOOGLE_IA` 
a `ANTHROPIC` y el modelo a `claude-sonnet-4-20250514`,
        *   **Entonces** todas las solicitudes subsiguientes al endpoint unificado deben ser enrutadas al proveedor Anthropic utilizando el modelo seleccionado para Anthropic.
    *   **Escenario 2: Especificación de modelo LLM para Google IA.**
        *   **Dado** que el proveedor de IA activo es Google IA,
        *   **Cuando** un Administrador del sistema especifica la variable de configuración `active_model` como `gemini-2.5-flash`,
        *   **Entonces** el servidor debe utilizar el modelo `gemini-2.5-flash` para todas las interacciones.
    *   **Escenario 3: Configuración inicial de proveedores.**
        *   **Dado** que el servidor se inicia por primera vez,
        *   **Cuando** las variables de entorno `active_provider` y `active_model` están configuradas con `GOOGLE_IA`, `gemini-2.5-flash`, respectivamente,
        *   **Entonces** el servidor debe inicializar los clientes para Google IA con su modelos correspondientes y utilizar Google IA como proveedor por defecto.
    * **Escenario 4: Prioridad de Configuración.**
        * **Dado** que si existen valores tanto en `.env` como en `base de datos`,
        * **Cuando** el sistema inicializa,
        * **Entonces** los valores de la base de datos deben prevalecer sobre las variables de entorno para permitir cambios en caliente sin redestiegue.
---

### Consideraciones Técnicas

1.  **Arquitectura de Patrones de Backend (SKILL.md):** El desarrollo del servidor debe seguir estrictamente los patrones y directrices definidos en `.agents\skills\nodejs-backend-patterns\SKILL.md`. Esto incluye, pero no se limita a, la estructura de directorios, la gestión de dependencias, la modularización, el manejo de errores, la validación de entradas y la implementación de la lógica de negocio.
2.  **Endpoint Unificado:** Se debe implementar un único endpoint HTTP POST (ej. `/api/generate-user-story`) que actúe 
como la interfaz principal para el frontend. Este endpoint será responsable de recibir las solicitudes, validarlas y delegarlas al módulo de enrutamiento de IA.
3.  **Contrato de Solicitud/Respuesta Normalizado:**
    *   **Solicitud:** El cuerpo de la solicitud al endpoint unificado debe ser un objeto JSON con un esquema predefinido.
    *   **Respuesta:** La respuesta del servidor debe ser un objeto JSON con un esquema estandarizado, independientemente del proveedor de IA utilizado. Este esquema debe incluir los campos necesarios para representar una historia de usuario y sus criterios de aceptación.
4.  **Mecanismo de Enrutamiento de IA:**
    *   Se debe desarrollar un módulo de enrutamiento que, basándose en la configuración de entorno (`active_provider`), seleccione dinámicamente el cliente del proveedor de IA adecuado (Google IA, Anthropic u Otro que se configure a futuro).
    *   Este módulo debe abstraer las diferencias en las APIs de los proveedores, presentando una interfaz unificada a la lógica de negocio del servidor.
5.  **Configuración Basada en Entorno:**
    *   Las credenciales de API para Google IA y Anthropic, así como los nombres de los modelos LLM (`gemini-2.5-flash`, `claude-sonnet-4-20250514`), deben ser configurables a través de variables de configuración.
    *   Se debe implementar un mecanismo robusto para cargar y validar estas configuraciones al inicio del servidor.
6.  **Abstración de Proveedores de IA:** Se deben implementar clientes específicos para interactuar con las APIs de los proveedores de IA. Estas implemntaciones  deben encapsular la lógica de autenticación de cada proveedor de IA, la construcción de solicitudes específicas del proveedor y el parseo de sus respuestas.
7.  **Manejo de Errores:** El servidor debe implementar un manejo de errores centralizado que capture excepciones de los proveedores de IA, errores de validación, mensajes y otros problemas, y devuelva respuestas de error consistentes al frontend.
8.  **Logging:** Se debe integrar un sistema de logging para registrar solicitudes, respuestas, errores y eventos importantes del sistema, facilitando la depuración y el monitoreo.

---
**Historia de Usuario:**

Como desarrollador, quiero acceder a la documentación interactiva de la API para entender cómo interactuar con el servidor y facilitar su integración y mantenimiento.

**Criterios de Aceptación:**

*   **Escenario: Acceso a la interfaz de documentación Swagger UI**
    *   **Dado** que el servidor "User Stories Studio Server" está en ejecución,
    *   **Cuando** un desarrollador navega a la ruta `/api-docs` en el servidor,
    *   **Entonces** se muestra una interfaz Swagger UI interactiva que presenta todos los endpoints expuestos por el servidor.

*   **Escenario: Visualización de detalles de un endpoint**
    *   **Dado** que la interfaz Swagger UI está visible,
    *   **Cuando** un desarrollador selecciona un endpoint específico (ej. `/api/generate-user-story`),
    *   **Entonces** puede ver la descripción del endpoint, los métodos HTTP soportados, los parámetros de solicitud (incluyendo tipo, formato y si son obligatorios), y los modelos de respuesta esperados.

*   **Escenario: Pruebas de endpoints desde la documentación**
    *   **Dado** que estoy visualizando los detalles de un endpoint en la interfaz Swagger UI,
    *   **Cuando** intento ejecutar una solicitud de prueba para ese endpoint,
    *   **Entonces** puedo introducir valores de ejemplo para los parámetros y ver la respuesta del servidor directamente en la interfaz.

**Consideraciones Técnicas:**

*   Se utilizarán las librerías `swagger-ui-express` para servir la interfaz de usuario de Swagger y `swagger-jsdoc` para generar la especificación OpenAPI a partir de comentarios en el código.
*   Los endpoints y modelos de datos se documentarán utilizando anotaciones `@openapi` directamente en el código fuente (ej. JSDoc para JavaScript/TypeScript).
*   Se configurará un archivo de especificación OpenAPI (ej. `swaggerDef.js`) para definir metadatos generales de la API como el título, la versión, la descripción y los esquemas de seguridad.
*   La ruta para acceder a la documentación (ej. `/api-docs`) debe ser configurable a través de variables de entorno.

---

**Historia de Usuario:**

*   **Formato:** Como servidor de User Stories Studio, quiero persistir mi configuración de proveedores de IA y modelos LLM en archivos JSON para asegurar la disponibilidad y consistencia de mi operación entre reinicios.

**Criterios de Aceptación:**

*   **Escenario: Persistencia de la configuración operativa**
    *   **Dado** que el servidor de User Stories Studio requiere una configuración de proveedores de IA (e.g., Google IA, Anthropic) y modelos LLM de estos proveedores (e.g., `gemini-2.5-flash`, `gemini-3.0-flash`, `claude-sonnet-4-20250514`),
    *   **Cuando** se define o actualiza la configuración operativa del servidor,
    *   **Entonces** la configuración debe ser almacenada automáticamente en archivos JSON.

*   **Escenario: Recuperación de la configuración al inicio del servidor**
    *   **Dado** que existen archivos JSON de configuración válidos,
    *   **Cuando** el servidor de User Stories Studio se inicia,
    *   **Entonces** el servidor debe cargar y aplicar la configuración almacenada para operar con los proveedores de IA y LLM especificados.

**Consideraciones Técnicas:**

*   Se debe definir una estructura JSON clara y consistente para almacenar la configuración de cada proveedor de IA y sus respectivos modelos LLM.
*   Se implementará un mecanismo robusto para el manejo de errores durante las operaciones de lectura y escritura de archivos (e.g., permisos, archivos corruptos, archivos no encontrados).
*   Se debe considerar la seguridad de cualquier información sensible (e.g., claves API) que pueda ser almacenada en estos archivos JSON, implementando cifrado o mecanismos de gestión de secretos si es necesario.
*   La informacion tecnica se enontrará en el archivo TECHNICAL_SPEC.md

---

### Historias de Usuario para "User Stories Studio Server"

**Historia de Usuario 1: Punto Final Unificado para Solicitudes de IA**

*   **Formato:** Como Product Owner, quiero que el servidor exponga un punto final unificado con un contrato de solicitud/respuesta normalizado para que el frontend no tenga conocimiento de los proveedores de IA subyacentes.
*   **Criterios de Aceptación:**
    *   **Dado** que el servidor está en ejecución,
    *   **Cuando** el frontend envía una solicitud de generación de historia de usuario al endpoint `/api/generate-user-story`,
    *   **Entonces** el servidor debe procesar la solicitud y devolver una respuesta con un formato predefinido, sin exponer detalles específicos del proveedor de IA utilizado.
*   **Consideraciones técnicas:**
    *   Definición del esquema de solicitud y respuesta normalizado (JSON).
    *   Implementación de un mecanismo de mapeo de respuestas de proveedores externos al formato normalizado.
    *   Manejo de errores y excepciones de proveedores externos para devolver un error normalizado al frontend.
---

**Historia de Usuario:**

Como Administrador del sistema, quiero seleccionar el proveedor de IA activo mediante una configuración persistente para gestionar los proveedores de IA de forma centralizada y dinámica sin requerir cambios en el código del cliente.

**Criterios de Aceptación:**

*   **Escenario: Configuración exitosa del proveedor de IA.**
    *   Dado que existe una variable de configuración para el proveedor de IA activo en la capa de persistencia
    *   Cuando un Administrador del sistema actualiza el valor de dicha variable a un proveedor de IA válido (ej. "Google IA")
    *   Entonces el servidor enrutará las solicitudes entrantes al endpoint unificado hacia el proveedor de IA configurado.

---

**Historia de Usuario:**

Como el sistema, quiero persistir las solicitudes y respuestas de los usuarios para gestionar el almacenamiento y la retención de datos de forma controlada y configurable.

**Criterios de Aceptación:**

*   **Dado** que una solicitud válida es procesada por el servidor y se obtiene una respuesta del proveedor de IA,
*   **Cuando** la persistencia está habilitada mediante la configuración,
*   **Entonces** la solicitud original y la respuesta del proveedor de IA son almacenadas en la capa de persistencia, asociadas al usuario que originó la solicitud.

*   **Dado** que existe una configuración que define un límite de almacenamiento o un período de retención para los datos persistidos,
*   **Cuando** el volumen de datos persistidos para un usuario excede el límite configurado o un registro excede su período de retención,
*   **Entonces** el sistema aplica automáticamente la política de retención configurada (ej. eliminación de los registros más antiguos o eliminar los que tengan mas de un mes).

*   **Dado** que la configuración de persistencia está deshabilitada,
*   **Cuando** el servidor procesa una solicitud y obtiene una respuesta del proveedor de IA,
*   **Entonces** la solicitud y la respuesta no son almacenadas en la capa de persistencia.

**Consideraciones Técnicas:**

*   **Esquema de Persistencia:** Se define como esquema de almacenamiento en base de datos con el email del usuario como indentificador (e.g, `usuario@email.com`) para almacenar la solicitud (payload de entrada), la respuesta (payload de salida), el proveedor de IA utilizado, el LLM específico, la fecha/hora de la interacción y cualquier metadato relevante.
*   **Configuración:** Implementar un mecanismo para cargar y aplicar las variables de configuración en la capa de persistencia (ej.  `MAX_USER_STORIES_STORAGE`, `RETENTION_PERIOD_DAYS`) desde una tabla de configuración en la base de datos.
*   **Identificación de Usuario:** Para acceder al sistema se solicitará el email  y se aplicara el metodo OTP via email para identificar y asociar las solicitudes y respuestas al usuario correcto.
*   **Mecanismo de Retención:** Las políticas de retención y limpieza de datos según la configuración se aplicarán cada vez que el usuario inicie el proceso de inicio de sesión.

---

**Historia de Usuario:**

*   **Formato:** Como Administrador del sistema, quiero que las API Keys de los proveedores de IA se gestionen exclusivamente en el backend para evitar su exposición al frontend y garantizar la seguridad de las credenciales.

*   **Criterios de Aceptación:**
    *   **Escenario 1: Prevención de exposición en el frontend.**
        *   **Dado** que un usuario interactúa con el frontend de User Stories Studio,
        *   **Cuando** se inspeccionan las solicitudes de red o el código fuente del frontend,
        *   **Entonces** ninguna API Key de los proveedores de IA (Google IA, Anthropic) debe ser visible o accesible.
    *   **Escenario 2: Uso seguro por el backend.**
        *   **Dado** que el backend de User Stories Studio necesita autenticarse con un proveedor de IA (ej. Google IA o Anthropic),
        *   **Cuando** el backend realiza una solicitud al proveedor de IA,
        *   **Entonces** debe utilizar las API Keys almacenadas de forma segura en el entorno del servidor, sin que estas sean transmitidas o expuestas al frontend en ninguna etapa.

*   **Consideraciones Técnicas:**
    *   **Almacenamiento Seguro:** Las API Keys deben almacenarse como variables de entorno en el servidor (.env) o en un servicio de gestión de secretos (ej. AWS Secrets Manager, Azure Key Vault, HashiCorp Vault).
    *   **Acceso Restringido:** Solo el proceso del servidor backend debe tener permisos para acceder a estas variables o secretos.
    *   **Inyección de Credenciales:** Las claves deben ser inyectadas en el entorno de ejecución del servidor, no hardcodeadas en el código fuente.
    *   **Proxy de Comunicación:** El backend debe ser el único componente que se comunica directamente con las APIs de los proveedores de IA, actuando como un proxy para todas las solicitudes del frontend.

    ---


**Historia de Usuario:**

Como servidor de la aplicación, quiero validar el origen de las solicitudes HTTP entrantes contra una lista blanca de dominios configurada para asegurar la integridad y el control de acceso al servicio.

**Criterios de Aceptación:**

*   **Escenario: Procesar solicitud de origen permitido**
    *   **Dado:** La variable de entorno `ALLOWED_ORIGINS` está configurada con un conjunto de dominios e.g., `http://localhost:3000, http://localhost:3001 ,https://user-stories-studio-client.vercel.app`.
    *   **Cuando:** El servidor recibe una solicitud HTTP con la cabecera `Origin: http://localhost:3000`.
    *   **Entonces:** El servidor procesa la solicitud y devuelve la respuesta correspondiente.

*   **Escenario: Rechazar solicitud de origen no permitido**
    *   **Dado:** La variable de entorno `ALLOWED_ORIGINS` está configurada e.g., `http://localhost:3000, http://localhost:3001 ,https://user-stories-studio-client.vercel.app`.
    *   **Cuando:** El servidor recibe una solicitud HTTP con la cabecera `Origin: http://otrodominio.com`.
    *   **Entonces:** El servidor rechaza la solicitud con un código de estado HTTP adecuado para no autorizado (401) y no procesa el contenido de la solicitud.

*   **Escenario: Configuración inicial de localhost**
    *   **Dado:** El archivo `.env` del servidor incluye la variable `ALLOWED_ORIGINS` con los dominios permitidos como uno de sus valores.
    *   **Cuando:** El servidor recibe una solicitud HTTP con la cabecera `Origin: http://localhost`.
    *   **Entonces:** El servidor procesa la solicitud y devuelve la respuesta correspondiente.

**Consideraciones Técnicas:**

*   La variable de configuración `ALLOWED_ORIGINS` debe ser capaz de almacenar uno o varios dominios,  separados por comas, para permitir la configuración de múltiples orígenes.
*   La implementación debe utilizar un middleware de Cross-Origin Resource Sharing (CORS) o una lógica de validación de la cabecera `Origin` para interceptar y evaluar las solicitudes entrantes.
*   Si en el servidor la variable `ALLOWED_ORIGINS` no está presente o está vacía se debe rechazar toda petición.
*   La validación debe considerar el protocolo (HTTP/HTTPS) y el puerto especificados en los dominios configurados y en la cabecera `Origin` de la solicitud.

