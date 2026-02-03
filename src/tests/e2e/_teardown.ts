import { rm, rmdir } from "node:fs/promises";

export default async function globalTeardown() {
	console.log("Running global teardown...");

	await Promise.all([
		rm(process.env.DATABASE_PATH ?? "").catch(() => {}),
		rm(`${process.env.DATABASE_PATH}-shm`).catch(() => {}),
		rm(`${process.env.DATABASE_PATH}-wal`).catch(() => {}),
		rmdir(process.env.UPLOADS_FOLDER ?? "").catch(() => {}),
	]);
}
