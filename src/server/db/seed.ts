import { Database } from "bun:sqlite";
import { writeFile } from "node:fs/promises";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { env } from "~/env";
import * as schema from "./schema";
import { auth } from "~/server/auth";
import type { UserRole } from "~/lib/constant";

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
      role: "admin" satisfies UserRole,
    },
  });
  console.log(
    "Admin user created with id",
    res.user.id,
    "and email",
    res.user.email,
  );
}

console.log("Database seeded");

db.$client.close();
