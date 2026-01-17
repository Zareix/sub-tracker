import { passkeyClient } from "@better-auth/passkey/client";
import {
	adminClient,
	apiKeyClient,
	genericOAuthClient,
	inferAdditionalFields,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "~/server/auth";

export type AuthProvider = "password" | "passkey" | `oauth-${string}`;

export const authClient = createAuthClient({
	// baseURL: env.NEXT_PUBLIC_AUTH_URL,
	plugins: [
		inferAdditionalFields<typeof auth>(),
		passkeyClient(),
		adminClient(),
		apiKeyClient(),
		genericOAuthClient(),
	],
});
