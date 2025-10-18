import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { apiKey } from "better-auth/plugins";
import { admin } from "better-auth/plugins/admin";
import { passkey } from "better-auth/plugins/passkey";
import type { NextRequest } from "next/server";
import { env } from "~/env";
import { Currencies, UserRoles } from "~/lib/constant";
import { db } from "~/server/db";
import {
	account,
	apiKey as apiKeySchema,
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
			apikey: apiKeySchema,
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
				type: [...UserRoles],
				required: true,
				input: false,
			},
			baseCurrency: {
				type: [...Currencies],
				required: true,
				defaultValue: "EUR",
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
		apiKey({
			rateLimit: {
				enabled: env.NODE_ENV === "production",
				maxRequests: 100,
				timeWindow: 60 * 1000, // 10 minutes
			},
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

export const verifyApiKey = async (req: NextRequest) => {
	const apiKey =
		req.headers.get("x-api-key") ?? req.nextUrl.searchParams.get("apiKey");
	if (!apiKey) {
		throw new Error("No API key provided");
	}

	const { valid, key, error } = await auth.api.verifyApiKey({
		body: { key: apiKey },
	});
	if (!valid || !key) {
		throw new Error(error?.message || "Invalid API key");
	}

	return await db.query.users.findFirst({
		where: (users, { eq }) => eq(users.id, key.userId),
	});
};
