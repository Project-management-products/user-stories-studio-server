import type { AIAdapter, NormalizedResponse } from "./AIAdapter.interface.js";
import dotenv from "dotenv";

dotenv.config();

export class AnthropicAdapter implements AIAdapter {
    private defaultModel = "claude-sonnet-4-20250514";

    async generate(prompt: string, context: string, modelId?: string): Promise<NormalizedResponse> {
        const start = Date.now();
        const modelName = modelId || this.defaultModel;
        const apiKey = process.env.ANTHROPIC_API_KEY;

        if (!apiKey) throw new Error("ANTHROPIC_API_KEY not found in .env");

        const systemInstruction = `
            Eres un experto en IA que actúa como un Gateway de prompts. 
            Genera una respuesta basada en el contexto y el prompt proporcionado.
            La respuesta DEBE ser un objeto JSON válido con la siguiente estructura:
            {
                "story_text": "...",
                "acceptance_criteria": ["...", "..."],
                "suggestions": ["...", "..."]
            }
            No incluyas explicaciones, saludos ni bloques de código markdown, solo el JSON puro.
        `.trim();

        const body = {
            model: modelName,
            max_tokens: 4000,
            system: systemInstruction,
            messages: [
                { role: "user", content: `Contexto: ${context}\n\nPrompt: ${prompt}` }
            ],
            temperature: 0.2,
        };

        try {
            const response = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": apiKey,
                    "anthropic-version": "2023-06-01",
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`${response.status} ${response.statusText}: ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            const responseText = data.content[0].text;
            const parsed = JSON.parse(responseText);

            return {
                story_text: parsed.story_text || "",
                acceptance_criteria: parsed.acceptance_criteria || [],
                suggestions: parsed.suggestions || [],
                metadata: {
                    provider: "anthropic",
                    model: modelName,
                    latency_ms: Date.now() - start
                }
            };
        } catch (error) {
            console.error("Anthropic AI Error:", error);
            throw error;
        }
    }
}
