export interface NormalizedResponse {
    story_text: string;
    acceptance_criteria: string[];
    suggestions: string[];
    metadata: {
        provider: string;
        model: string;
        latency_ms: number;
    };
}

export interface AIAdapter {
    generate(prompt: string, context: string, modelId?: string): Promise<NormalizedResponse>;
}
