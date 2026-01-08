import { Database } from "bun:sqlite";
import { rm } from "node:fs/promises";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { env } from "~/env";
import * as schema from "./schema";

if (env.NODE_ENV === "test") {
	await rm(env.DATABASE_PATH, { force: true });
}

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
	client: Database;
};

export const client = globalForDb.client ?? new Database(env.DATABASE_PATH);
if (env.NODE_ENV !== "production") globalForDb.client = client;

client.run("PRAGMA journal_mode = WAL;");
client.run("PRAGMA foreign_keys = ON;");

export const db = drizzle(client, { schema });

// -------------------------------- UTILS -------------------------------- //
// TODO This does not handle concurrent transactions.
export const runTransaction = async <T, DB extends typeof db>(
	database: DB,
	callback: (database: DB) => Promise<T>,
): Promise<T> => {
	database.run(sql`BEGIN`);

	try {
		const result = await callback(database);
		database.run(sql`COMMIT`);
		return result;
	} catch (error) {
		database.run(sql`ROLLBACK`);
		throw error;
	}
};
