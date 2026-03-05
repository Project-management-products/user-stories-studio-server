import type { AIAdapter } from "./AIAdapter.interface.js";
import { GoogleAdapter } from "./GoogleAdapter.js";
import { AnthropicAdapter } from "./AnthropicAdapter.js";

export class AIFactory {
    static getAdapter(provider?: string): AIAdapter {
        const activeProvider = provider || process.env.ACTIVE_IA_PROVIDER || "google";

        switch (activeProvider.toLowerCase()) {
            case "google":
                return new GoogleAdapter();
            case "anthropic":
                return new AnthropicAdapter();
            default:
                throw new Error(`AI Provider "${activeProvider}" is not supported.`);
        }
    }
}
