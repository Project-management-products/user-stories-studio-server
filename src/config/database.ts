import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.DB_CONN_TURSO;
const authToken = process.env.TURSO_AUTH_TOKEN || process.env["DATA-BASE-TURSO"];

if (!url) {
    throw new Error("DB_CONN_TURSO is not defined in .env");
}

export const dbClient = createClient({
    url: url,
    authToken: authToken as string,
});
