import { passkey } from "@better-auth/passkey";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { apiKey, genericOAuth } from "better-auth/plugins";
import { admin } from "better-auth/plugins/admin";
import { headers } from "next/headers";
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
	trustedOrigins: [env.BETTER_AUTH_URL].concat(
		env.NODE_ENV === "development"
			? ["http://localhost:3000", "http://192.168.31.6:3000"]
			: [],
	),
	plugins: [
		env.OAUTH_ENABLED && env.OAUTH_PROVIDER_ID && env.OAUTH_CLIENT_ID
			? genericOAuth({
					config: [
						{
							// biome-ignore lint/style/noNonNullAssertion : OAUTH_ENABLED
							providerId: env.OAUTH_PROVIDER_ID!,
							// biome-ignore lint/style/noNonNullAssertion : OAUTH_ENABLED
							clientId: env.OAUTH_CLIENT_ID!,
							clientSecret: env.OAUTH_CLIENT_SECRET,
							discoveryUrl: env.OAUTH_DISCOVERY_URL,
							scopes: ["openid", "email", "profile"],
						},
					],
				})
			: null,
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
				timeWindow: 1000,
			},
		}),
		admin(),
	].filter(Boolean),
});

export type Session = typeof auth.$Infer.Session;

export const isAuthenticated = async () => !!(await getAuthSession())?.user;

export const getAuthSession = async () =>
	auth.api.getSession({
		headers: await headers(),
	});

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
