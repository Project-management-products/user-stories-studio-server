import { dbClient } from "../config/database.js";
import type { NormalizedResponse } from "../adapters/ai/AIAdapter.interface.js";
import { v4 as uuidv4 } from "uuid";

export class InteractionRepository {
    async saveInteraction(
        projectId: string,
        userId: string,
        promptPayload: any,
        response: NormalizedResponse
    ) {
        const id = uuidv4();
        try {
            await dbClient.execute({
                sql: `
          INSERT INTO interactions (
            id, project_id, user_id, prompt_payload, response_payload, 
            ai_provider, ai_model, latency_ms
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
                args: [
                    id,
                    projectId,
                    userId,
                    JSON.stringify(promptPayload),
                    JSON.stringify(response),
                    response.metadata.provider,
                    response.metadata.model,
                    response.metadata.latency_ms
                ]
            });
            return id;
        } catch (error) {
            console.error("Error saving interaction to DB:", error);
            throw error;
        }
    }

    async getRecentInteractions(projectId: string, limit: number = 10) {
        try {
            const result = await dbClient.execute({
                sql: `SELECT * FROM interactions WHERE project_id = ? AND active = 1 ORDER BY created_at DESC LIMIT ?`,
                args: [projectId, limit]
            });
            return result.rows;
        } catch (error) {
            console.error("Error fetching interactions:", error);
            throw error;
        }
    }
}
