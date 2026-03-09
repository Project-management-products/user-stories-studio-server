import { dbClient } from "./database.js";

export const initDb = async () => {
  console.log("Initializing database schema...");

  try {
    // 1. Projects table
    await dbClient.execute(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        system_instruction TEXT,
        markdown_standard TEXT,
        system_constraints TEXT,
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME
      )
    `);

    // 2. Users table
    await dbClient.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        otp_code TEXT,
        otp_expires_at DATETIME,
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME
      )
    `);

    // 3. Interactions table
    await dbClient.execute(`
      CREATE TABLE IF NOT EXISTS interactions (
        id TEXT PRIMARY KEY,
        project_id TEXT REFERENCES projects(id),
        user_id TEXT REFERENCES users(id),
        prompt_payload TEXT NOT NULL,
        response_payload TEXT NOT NULL,
        ai_provider TEXT NOT NULL,
        ai_model TEXT NOT NULL,
        latency_ms INTEGER,
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME
      )
    `);

    // 4. Config store table
    await dbClient.execute(`
      CREATE TABLE IF NOT EXISTS config_store (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME
      )
    `);

    console.log("Database schema initialized successfully.");
  } catch (error) {
    console.error("Error initializing database schema:", error);
    throw error;
  }
};

// If run directly
if (require.main === module) {
  initDb();
}