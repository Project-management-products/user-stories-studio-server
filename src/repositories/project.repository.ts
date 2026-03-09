import { dbClient } from "../config/database.js";

export interface Project {
    id: string;
    name: string;
    description: string;
    system_instruction: string;
    markdown_standard: string;
    system_constraints: string;
}

export class ProjectRepository {
    async getProjectById(id: string): Promise<Project | null> {
        const result = await dbClient.execute({
            sql: `SELECT * FROM projects WHERE id = ? AND active = 1`,
            args: [id.trim()]
        });

        if (result.rows.length === 0) return null;

        return result.rows[0] as unknown as Project;
    }
}
