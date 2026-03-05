import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import type { AIAdapter, NormalizedResponse } from "./AIAdapter.interface.js";
import dotenv from "dotenv";

dotenv.config();

export class GoogleAdapter implements AIAdapter {
    private ai: GoogleGenAI;
    private defaultModel = "gemini-2.5-flash";

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY not found in .env");
        this.ai = new GoogleGenAI({ apiKey });
    }

    async generate(prompt: string, context: string, modelId?: string): Promise<NormalizedResponse> {
        const start = Date.now();
        const modelName = modelId || this.defaultModel;

        const systemInstruction = `
            Eres un experto en IA diseñado para actuar como un Gateway de prompts. 
            Tu objetivo es generar respuestas de alta calidad basadas en el contexto y el prompt proporcionado.
            La respuesta DEBE ser un objeto JSON válido con la siguiente estructura:
            {
                "story_text": "...",
                "acceptance_criteria": ["...", "..."],
                "suggestions": ["...", "..."]
            }
            No incluyas explicaciones, saludos ni bloques de código markdown, solo el JSON puro.
        `.trim();

        const fullPrompt = `Contexto: ${context}\n\nPrompt: ${prompt}`;

        try {
            const result = await (this.ai as any).models.generateContent({
                model: modelName,
                systemInstruction: systemInstruction,
                contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
                config: {
                    temperature: 0.2,
                    responseMimeType: "application/json",
                }
            });

            // For Gemini 1.x response might be in result.response.text()
            // In some versions of this experimental SDK it might be directly in result.text
            const responseText = typeof result.text === "function" ? result.text() : result.text;
            const parsed = typeof responseText === "string" ? JSON.parse(responseText) : responseText;

            return {
                story_text: parsed.story_text || "",
                acceptance_criteria: parsed.acceptance_criteria || [],
                suggestions: parsed.suggestions || [],
                metadata: {
                    provider: "google",
                    model: modelName,
                    latency_ms: Date.now() - start
                }
            };
        } catch (error) {
            console.error("Google AI Error:", error);
            throw error;
        }
    }
}
