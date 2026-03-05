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
                description: "Plataforma para generación de Historias de Usuario"
            },
            {
                id: "vtt-reports",
                name: "VTT Report Generator",
                description: "Generador de informes a partir de transcripciones VTT"
            }
        ];

        for (const project of projects) {
            await dbClient.execute({
                sql: `INSERT OR REPLACE INTO projects (id, name, description) VALUES (?, ?, ?)`,
                args: [project.id, project.name, project.description]
            });
            console.log(`Project ${project.name} seeded.`);
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
