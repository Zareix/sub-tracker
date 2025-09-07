import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins/admin";
import { passkey } from "better-auth/plugins/passkey";
import type { NextRequest } from "next/server";
import { env } from "~/env";
import { db } from "~/server/db";
import {
	account,
	passkey as passkeySchema,
	session,
	users,
	verification,
} from "~/server/db/schema";
import { sendResetPasswordEmail } from "~/server/email";

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
		sendResetPassword: async ({ user, url }) => {
			await sendResetPasswordEmail({
				to: user.email,
				url,
			});
		},
		resetPasswordTokenExpiresIn: 6 * 60 * 60, // 6 hour
		password: {
			hash: Bun.password.hash,
			verify: ({ password, hash }) => {
				return Bun.password.verify(password, hash);
			},
		},
	},
	advanced: {
		database: { generateId: false },
	},
	user: {
		changeEmail: {
			enabled: true,
		},
		additionalFields: {
			role: {
				type: "string",
				required: true,
				input: false,
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
		admin(),
	],
});

export type Session = typeof auth.$Infer.Session;

export const isAuthenticated = async (req: NextRequest) =>
	!!(
		await auth.api.getSession({
			headers: req.headers,
		})
	)?.user;
