import type { Request, Response, NextFunction } from "express";
import { PromptService } from "../services/prompt.service.js";
import { z } from "zod";

const promptSchema = z.object({
    email: z.string().email(),
    prompt: z.string().min(1),
    context: z.string().optional().default("General"),
    modelId: z.string().optional(),
    provider: z.string().optional()
});

export class PromptController {
    private promptService = new PromptService();

    async generate(req: Request, res: Response, next: NextFunction) {
        try {
            const projectId = req.params.projectId as string;
            const validated = promptSchema.parse(req.body);

            if (!projectId) {
                res.status(400).json({ error: "projectId is required in the path" });
                return;
            }

            const result = await this.promptService.processPrompt(
                projectId,
                validated.email,
                validated.prompt,
                validated.context,
                validated.modelId,
                validated.provider
            );
            console.log("DEBUG - Response:", JSON.stringify(result, null, 2));

            // 4. Return response (including legacy compatibility)
            res.status(200).json({
                ...result,
                content: [
                    { text: result.story_text }
                ]
            });
        } catch (error) {
            next(error);
        }
    }
}
