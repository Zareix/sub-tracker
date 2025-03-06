import { db } from "~/server/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  account,
  session,
  users,
  verification,
  passkey as passkeySchema,
} from "~/server/db/schema";
import { env } from "~/env";
import { passkey } from "better-auth/plugins/passkey";
import type { NextRequest } from "next/server";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: users,
      session,
      account,
      verification,
      passkey: passkeySchema,
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
  plugins: [
    passkey({
      rpID:
        env.NODE_ENV === "production" && env.BETTER_AUTH_URL
          ? new URL(env.BETTER_AUTH_URL).host
          : "localhost",
      rpName: "Subtracker",
      origin: env.BETTER_AUTH_URL,
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;

export const isAuthenticated = async (req: NextRequest) =>
  !!(
    await auth.api.getSession({
      headers: req.headers,
    })
  )?.user;
