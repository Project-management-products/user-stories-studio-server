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

        const defaultInstruction = "Eres un Asistente experto. Tu trabajo es transformar ideas en contenidos útiles.";
        const defaultMarkdown = "Utiliza formato Markdown estándar.";
        const defaultConstraints = "Responde únicamente con el contenido solicitado sin charla trivial.";

        const instruction = `${systemInstruction || defaultInstruction}\n${markdownStandard || defaultMarkdown}\n${systemConstraints || defaultConstraints}`;
        const fullPrompt = `Contexto:\n${context}\n\nPrompt:\n${prompt}`;

        try {
            console.log("DEBUG - AI Request model:", modelName);
            const result = await (this.ai as any).models.generateContent({
                model: modelName,
                contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
                config: {
                    systemInstruction: instruction,
                    temperature: 0.2,
                    safetySettings: [
                        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    ],
                }
            });

            // Depuración profunda del objeto de respuesta
            // console.log("RAW RESULT FROM GEMINI:", JSON.stringify(result, null, 2));

            let responseText = "";

            // Intentamos obtener el texto de todas las formas posibles que usa el SDK
            if (result.text && typeof result.text !== "function") {
                responseText = result.text;
            } else if (typeof result.text === "function") {
                responseText = result.text();
            } else if (result.response) {
                if (typeof result.response.text === "function") {
                    responseText = result.response.text();
                } else if (result.response.candidates && result.response.candidates[0]?.content?.parts[0]?.text) {
                    responseText = result.response.candidates[0].content.parts[0].text;
                }
            }

            console.log("DEBUG - Extracted Text Length:", responseText.length);

            return {
                story_text: responseText,
                acceptance_criteria: [],
                suggestions: [],
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
