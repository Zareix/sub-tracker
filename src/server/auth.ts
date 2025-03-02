import { db } from "~/server/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { account, session, users, verification } from "~/server/db/schema";
import { env } from "~/env";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: users,
      session,
      account,
      verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    password: {
      hash: Bun.password.hash,
      verify: ({ password, hash }) => {
        return Bun.password.verify(password, hash);
      },
    },
  },
  advanced: {
    generateId: false,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
      },
    },
  },
  trustedOrigins: [env.BETTER_AUTH_URL],
});

export type Session = typeof auth.$Infer.Session;
