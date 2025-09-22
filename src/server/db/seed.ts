import { Database } from "bun:sqlite";
import { writeFile } from "node:fs/promises";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { headers } from "next/headers";
import { env } from "~/env";
import type { UserRole } from "~/lib/constant";
import { auth } from "~/server/auth";
import * as schema from "./schema";

if (!(await Bun.file(env.DATABASE_PATH).exists())) {
	console.log("Database file created");
	await writeFile(env.DATABASE_PATH, "");
}

console.log("Seeding database...");

const sqlite = new Database(env.DATABASE_PATH);
sqlite.exec("PRAGMA journal_mode = WAL;");
sqlite.exec("PRAGMA foreign_keys = ON;");
const db = drizzle(sqlite, { schema });

const users = await db.query.users.findMany();
if (users.length === 0) {
	console.log("Creating admin user...");
	const res = await auth.api.signUpEmail({
		body: {
			name: "Admin",
			email: env.ADMIN_EMAIL,
			password: "password",
		},
	});
	await auth.api.setRole({
		headers: await headers(),
		body: {
			userId: res.user.id,
			role: "admin" satisfies UserRole,
		},
	});
	console.log(
		"Admin user created with id",
		res.user.id,
		"and email",
		res.user.email,
		"and default password is 'password'. Please change the password after logging in.",
	);
}

const cat = await db.query.categories.findMany();
if (cat.length === 0) {
	console.log("Creating default category...");
	await db.insert(schema.categories).values({
		name: "Misc",
		icon: "circle-ellipsis",
	});
}

console.log("Database seeded");

db.$client.close();
