import { AIFactory } from "../adapters/ai/AIFactory.js";
import { InteractionRepository } from "../repositories/interaction.repository.js";
import { UserRepository } from "../repositories/user.repository.js";
import type { NormalizedResponse } from "../adapters/ai/AIAdapter.interface.js";
import { getConfig } from "../config/dynamicConfig.js";

import { ProjectRepository } from "../repositories/project.repository.js";

export class PromptService {
    private interactionRepo = new InteractionRepository();
    private projectRepo = new ProjectRepository();
    private userRepo = new UserRepository();

    async processPrompt(
        projectId: string,
        email: string,
        prompt: string,
        context: string,
        modelId?: string,
        provider?: string
    ): Promise<NormalizedResponse> {

        // 1. Get/Create User and Get Project Settings
        const [user, project] = await Promise.all([
            this.userRepo.getOrCreateUser(email),
            this.projectRepo.getProjectById(projectId)
        ]);

        // 2. Select AI Provider (preferring DB config)
        const activeProvider = provider || await getConfig("ACTIVE_IA_PROVIDER", "google");
        const adapter = AIFactory.getAdapter(activeProvider);

        // 3. Generate content from AI passing specific project prompts if they exist
        const result = await adapter.generate(
            prompt,
            context,
            modelId,
            project?.system_instruction,
            project?.markdown_standard,
            project?.system_constraints
        );

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
