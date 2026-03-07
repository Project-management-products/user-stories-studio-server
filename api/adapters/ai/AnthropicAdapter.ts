import type { AIAdapter, NormalizedResponse } from "./AIAdapter.interface.js";
import dotenv from "dotenv";

dotenv.config();

export class AnthropicAdapter implements AIAdapter {
    private defaultModel = "claude-3-5-sonnet-20241022";
    // private defaultModel = "claude-sonnet-4-20250514";

    async generate(
        prompt: string,
        context: string,
        modelId?: string,
        systemInstruction?: string,
        markdownStandard?: string,
        systemConstraints?: string
    ): Promise<NormalizedResponse> {
        const start = Date.now();
        const modelName = modelId || this.defaultModel;
        const apiKey = process.env.ANTHROPIC_API_KEY;

        if (!apiKey) throw new Error("ANTHROPIC_API_KEY not found in .env");

        const defaultInstruction = "Eres un Asistente experto. Tu trabajo es transformar ideas en contenidos útiles.";
        const defaultMarkdown = "Utiliza formato Markdown estándar.";
        const defaultConstraints = "Responde únicamente con el contenido solicitado sin charla trivial.";

        const instruction = `${systemInstruction || defaultInstruction}\n${markdownStandard || defaultMarkdown}\n${systemConstraints || defaultConstraints}`;

        const body = {
            model: modelName,
            max_tokens: 4000,
            system: instruction,
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

            return {
                story_text: responseText,
                acceptance_criteria: [],
                suggestions: [],
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
