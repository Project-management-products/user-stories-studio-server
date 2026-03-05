import type { Request, Response, NextFunction } from "express";
import { PromptService } from "../services/prompt.service.js";
import { z } from "zod";

const promptSchema = z.object({
    projectId: z.string().min(1),
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
            const validated = promptSchema.parse(req.body);

            const result = await this.promptService.processPrompt(
                validated.projectId,
                validated.email,
                validated.prompt,
                validated.context,
                validated.modelId,
                validated.provider
            );

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}
