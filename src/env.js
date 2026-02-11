import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v4-mini";

export const env = createEnv({
	/**
	 * Specify your server-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars.
	 */
	server: {
		NODE_ENV: z._default(
			z.enum(["development", "test", "production"]),
			"development",
		),
		BETTER_AUTH_SECRET:
			process.env.NODE_ENV === "production"
				? z.string()
				: z.optional(z.string()),
		BETTER_AUTH_URL: z.url(),
		ADMIN_EMAIL: z.string(),
		DATABASE_PATH: z._default(z.string(), "./db.sqlite"),
		UPLOADS_FOLDER: z._default(z.string(), "./temp/uploads"),

		FIXER_API_KEY: z.optional(z.string()),

		S3_ENABLED: z._default(
			z.boolean(),
			!!process.env.S3_BUCKET &&
				!!process.env.S3_ACCESS_KEY_ID &&
				!!process.env.S3_SECRET_ACCESS_KEY &&
				!!process.env.S3_REGION &&
				!!process.env.S3_ENDPOINT,
		),
		S3_BUCKET: z.optional(z.string()),
		S3_ACCESS_KEY_ID: z.optional(z.string()),
		S3_SECRET_ACCESS_KEY: z.optional(z.string()),
		S3_REGION: z.optional(z.string()),
		S3_ENDPOINT: z.optional(z.string()),

		GOOGLE_SEARCH_ID: z.optional(z.string()),
		GOOGLE_SEARCH_KEY: z.optional(z.string()),

		EMAIL_SERVER: z.optional(z.string()),
		EMAIL_FROM: z.optional(z.email()),

		OAUTH_ENABLED: z._default(
			z.boolean(),
			!!process.env.OAUTH_PROVIDER_ID &&
				!!process.env.OAUTH_CLIENT_ID &&
				!!process.env.OAUTH_CLIENT_SECRET &&
				!!process.env.OAUTH_DISCOVERY_URL,
		),
		OAUTH_PROVIDER_ID: z.optional(z.string()),
		OAUTH_CLIENT_ID: z.optional(z.string()),
		OAUTH_CLIENT_SECRET: z.optional(z.string()),
		OAUTH_DISCOVERY_URL: z.optional(z.string()),
	},

	/**
	 * Specify your client-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars. To expose them to the client, prefix them with
	 * `NEXT_PUBLIC_`.
	 */
	client: {
		NEXT_PUBLIC_ENV: z._default(
			z.enum(["development", "test", "production"]),
			"development",
		),
		// NEXT_PUBLIC_AUTH_URL: z.string().url(),
	},

	/**
	 * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
	 * middlewares) or client-side so we need to destruct manually.
	 */
	runtimeEnv: {
		BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
		BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
		ADMIN_EMAIL: process.env.ADMIN_EMAIL,
		DATABASE_PATH: process.env.DATABASE_PATH,
		NODE_ENV: process.env.NODE_ENV,
		NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
		FIXER_API_KEY: process.env.FIXER_API_KEY,
		UPLOADS_FOLDER: process.env.UPLOADS_FOLDER,
		S3_ENABLED: process.env.S3_ENABLED,
		S3_BUCKET: process.env.S3_BUCKET,
		S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
		S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
		S3_REGION: process.env.S3_REGION,
		S3_ENDPOINT: process.env.S3_ENDPOINT,
		GOOGLE_SEARCH_ID: process.env.GOOGLE_SEARCH_ID,
		GOOGLE_SEARCH_KEY: process.env.GOOGLE_SEARCH_KEY,
		EMAIL_SERVER: process.env.EMAIL_SERVER,
		EMAIL_FROM: process.env.EMAIL_FROM,
		OAUTH_ENABLED: process.env.OAUTH_ENABLED,
		OAUTH_CLIENT_ID: process.env.OAUTH_CLIENT_ID,
		OAUTH_CLIENT_SECRET: process.env.OAUTH_CLIENT_SECRET,
		OAUTH_PROVIDER_ID: process.env.OAUTH_PROVIDER_ID,
		OAUTH_DISCOVERY_URL: process.env.OAUTH_DISCOVERY_URL,
	},
	/**
	 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
	 * useful for Docker builds.
	 */
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	/**
	 * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
	 * `SOME_VAR=''` will throw an error.
	 */
	emptyStringAsUndefined: true,
});
