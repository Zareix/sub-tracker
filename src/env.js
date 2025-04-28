import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	/**
	 * Specify your server-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars.
	 */
	server: {
		BETTER_AUTH_SECRET:
			process.env.NODE_ENV === "production"
				? z.string()
				: z.string().optional(),
		BETTER_AUTH_URL: z.string().url(),
		ADMIN_EMAIL: z.string(),
		DATABASE_PATH: z.string(),
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
		UPLOADS_FOLDER: z.string(),
		FIXER_API_KEY: z.string().optional(),
		S3_ENABLED: z.preprocess(
			(val) =>
				!!val ||
				(!!process.env.S3_BUCKET &&
					!!process.env.S3_ACCESS_KEY_ID &&
					!!process.env.S3_SECRET_ACCESS_KEY &&
					!!process.env.S3_REGION &&
					!!process.env.S3_ENDPOINT),
			z.boolean().default(false),
		),
		S3_BUCKET: z.string().optional(),
		S3_ACCESS_KEY_ID: z.string().optional(),
		S3_SECRET_ACCESS_KEY: z.string().optional(),
		S3_REGION: z.string().optional(),
		S3_ENDPOINT: z.string().optional(),
	},

	/**
	 * Specify your client-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars. To expose them to the client, prefix them with
	 * `NEXT_PUBLIC_`.
	 */
	client: {
		NEXT_PUBLIC_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
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
