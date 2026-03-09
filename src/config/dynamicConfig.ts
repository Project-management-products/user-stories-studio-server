import { dbClient } from "./database.js";
import dotenv from "dotenv";

dotenv.config();

export const getConfig = async (key: string, defaultValue?: string): Promise<string | undefined> => {
    try {
        const result = await dbClient.execute({
            sql: `SELECT value FROM config_store WHERE key = ? AND active = 1`,
            args: [key]
        });

        if (result.rows && result.rows.length > 0) {
            return result.rows[0]?.value as string;
        }
    } catch (error) {
        console.warn(`Could not load config for ${key} from DB, falling back to process.env:`, error);
    }

    return process.env[key] || defaultValue;
};
