import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";

import { env } from "~/env";
import * as schema from "./schema";
import { sql } from "drizzle-orm";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  client: Database;
};

export const client = globalForDb.client ?? new Database(env.DATABASE_PATH);
if (env.NODE_ENV !== "production") globalForDb.client = client;

client.exec("PRAGMA journal_mode = WAL;");
client.exec("PRAGMA foreign_keys = ON;");

export const db = drizzle(client, { schema });

export const runTransaction = async <T>(
  database: typeof db,
  callback: () => Promise<T>,
): Promise<T> => {
  database.run(sql`BEGIN`);

  try {
    const result = await callback();
    database.run(sql`COMMIT`);
    return result;
  } catch (error) {
    database.run(sql`ROLLBACK`);
    throw error;
  }
};
