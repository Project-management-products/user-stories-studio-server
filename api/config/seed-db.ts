import { dbClient } from "./database.js";
import { v4 as uuidv4 } from "uuid";

export const seedDb = async () => {
    console.log("Seeding database with initial data...");

    try {
        // 1. Insert initial configurations
        const configs = [
            { key: "ACTIVE_IA_PROVIDER", value: "google" },
            { key: "PERSISTENCE_ENABLED", value: "true" },
            { key: "MAX_PAYLOAD_SIZE", value: "50mb" },
            { key: "AVAILABLE_PROVIDERS", value: JSON.stringify(["google", "anthropic"]) },
            { key: "GOOGLE_DEFAULT_MODEL", value: "gemini-2.5-flash" },
            { key: "ANTHROPIC_DEFAULT_MODEL", value: "claude-sonnet-4-20250514" },
            { key: "SUPPORTED_MODELS_GOOGLE", value: JSON.stringify(["gemini-2.5-flash", "gemini-1.5-pro"]) },
            { key: "SUPPORTED_MODELS_ANTHROPIC", value: JSON.stringify(["claude-sonnet-4-20250514", "claude-3-5-haiku-20241022"]) }
        ];
        for (const config of configs) {
            await dbClient.execute({
                sql: `INSERT OR REPLACE INTO config_store (key, value) VALUES (?, ?)`,
                args: [config.key, config.value]
            });
            console.log(`Config ${config.key} seeded.`);
        }

        // 2. Insert default projects
        const projects = [
            {
                id: "user-stories-studio",
                name: "User Stories Studio",
                description: "Plataforma para generación de Historias de Usuario",
                system_instruction: "Eres un Product Owner experto. Tu trabajo es transformar ideas en requerimientos técnicos.",
                markdown_standard: " # Estándar de Redacción de Historias de Usuario \n## **Historia de Usuario:**\n### 1. **Título:** Debe ser corto y descriptivo.\n### 2. **Descripción:** \n\"**Como** [rol], **quiero** [acción] **para** [beneficio]\".\n### 3. **Criterios de Aceptación:** Deben usar el formato BDD (Dado, Cuando, Entonces).\n### 4. **Consideraciones técnicas:**",
                system_constraints: "Responde únicamente con el bloque de código/texto solicitado. Elimina toda charla trivial, introducciones, conclusiones o confirmaciones de que entendiste la tarea. Usar tono técnico, directo y sin ambigüedades."
            },
            {
                id: "vtt-reports",
                name: "VTT Report Generator",
                description: "Generador de informes a partir de transcripciones VTT",
                system_instruction: "Actúa como un Estratega de Efectividad Organizacional y Especialista en Comunicación Corporativa senior. Tu función es procesar transcripciones de reuniones optimizadas (que incluyen duraciones de habla [Xs] y métricas pre-calculadas) para extraer inteligencia de negocio. Debes transformar los datos crudos en un reporte detallado que preserve el contexto de las decisiones y evalúe la eficiencia operativa.",
                markdown_standard: "El reporte debe seguir estrictamente esta jerarquía:\n* `Reporte de Análisis: [Nombre de la Reunión]`\n* `1. Resumen Ejecutivo` (Resultados de alto nivel)\n* `2. Desarrollo y Contexto de la Discusión` (Narrativa detallada por bloques temáticos)\n* `3. Matriz de Acciones y Compromisos` (Tabla: Tarea | Responsable | Fecha Límite)\n* `4. Inteligencia de Participación y Sentimiento` (Párrafos sobre el tono y clima)\n* `5. Seguimiento de Temas Específicos` (Basado en la variable TOPICOS_CLAVE)\n* `6. Diagnóstico de Efectividad`(Feedback de la Sesión)\n* `7. Tabla Estadísticas de Participación` (entregada en Entradas a analizar)\n* `---\n* `Borrador de Email de Seguimiento` (Bloque de texto profesional)",
                system_constraints: "**Fidelidad y Contexto:** No inventes datos. En la sección de \"Desarrollo\", prioriza explicar los argumentos clave mencionados en la transcripción.\n**Manejo de Ambigüedad:** Si una tarea no tiene responsable, usa el tag `[POR DEFINIR]`.\n**Sin Juicios Personales:** El análisis de eficiencia y feedback debe centrarse en procesos, no en el volumen de habla individual.\n**Concisión Selectiva:** El resumen debe ser breve, pero el \"Desarrollo\" debe ser lo suficientemente rico para que un ausente entienda la reunión por completo.\n\n"
            }
        ];

        for (const project of projects) {
            await dbClient.execute({
                sql: `INSERT OR REPLACE INTO projects (id, name, description, system_instruction, markdown_standard, system_constraints) VALUES (?, ?, ?, ?, ?, ?)`,
                args: [
                    project.id,
                    project.name,
                    project.description,
                    project.system_instruction,
                    project.markdown_standard,
                    project.system_constraints
                ]
            });
            console.log(`Project ${project.name} seeded with specific prompts.`);
        }

        console.log("Database seeded successfully.");
    } catch (error) {
        console.error("Error seeding database:", error);
        throw error;
    }
};

// If run directly
if (import.meta.url.endsWith("seed-db.ts")) {
    seedDb();
}
