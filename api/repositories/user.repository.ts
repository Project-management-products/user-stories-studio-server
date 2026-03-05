import { dbClient } from "../config/database.js";
import { v4 as uuidv4 } from "uuid";

export class UserRepository {
    async getUserByEmail(email: string) {
        const result = await dbClient.execute({
            sql: `SELECT * FROM users WHERE email = ? AND active = 1`,
            args: [email]
        });
        return result.rows[0];
    }

    async getOrCreateUser(email: string) {
        let user = await this.getUserByEmail(email);
        if (!user) {
            const id = uuidv4();
            await dbClient.execute({
                sql: `INSERT INTO users (id, email) VALUES (?, ?)`,
                args: [id, email]
            });
            user = { id, email, active: 1 } as any;
        }
        return user as any;
    }
}
