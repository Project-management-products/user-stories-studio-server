import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "AI Gateway API - User Stories Studio & Beyond",
            version: "1.0.0",
            description: "Servidor agnostic para gestión de prompts e interacciones con IA (Google Gemini, Anthropic Claude).",
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Servidor de Desarrollo Local",
            },
        ],
    },
    apis: ["./src/routes/*.ts", "./src/routes/*.js"], // Supports both TS (dev) and JS (build), routes on real path
};

export const swaggerSpec = swaggerJSDoc(options);
