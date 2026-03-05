import { AIFactory } from "../adapters/ai/AIFactory.js";
import { InteractionRepository } from "../repositories/interaction.repository.js";
import { UserRepository } from "../repositories/user.repository.js";
import type { NormalizedResponse } from "../adapters/ai/AIAdapter.interface.js";
import { getConfig } from "../config/dynamicConfig.js";

export class PromptService {
    private interactionRepo = new InteractionRepository();
    private userRepo = new UserRepository();

    async processPrompt(
        projectId: string,
        email: string,
        prompt: string,
        context: string,
        modelId?: string,
        provider?: string
    ): Promise<NormalizedResponse> {

        // 1. Get/Create User
        const user = await this.userRepo.getOrCreateUser(email);

        // 2. Select AI Provider (preferring DB config)
        const activeProvider = provider || await getConfig("ACTIVE_IA_PROVIDER", "google");
        const adapter = AIFactory.getAdapter(activeProvider);

        // 3. Generate content from AI
        const result = await adapter.generate(prompt, context, modelId);

        // 4. Save interaction in Turso (async but important)
        const persistenceEnabled = await getConfig("PERSISTENCE_ENABLED", "true");
        if (persistenceEnabled === "true") {
            this.interactionRepo.saveInteraction(
                projectId,
                user.id as string,
                { prompt, context },
                result
            ).catch(e => console.error("Persistence error:", e));
        }

        return result;
    }
}
