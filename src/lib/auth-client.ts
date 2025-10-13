import {
	adminClient,
	apiKeyClient,
	inferAdditionalFields,
	passkeyClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "~/server/auth";

export const authClient = createAuthClient({
	// baseURL: env.NEXT_PUBLIC_AUTH_URL,
	plugins: [
		inferAdditionalFields<typeof auth>(),
		passkeyClient(),
		adminClient(),
		apiKeyClient(),
	],
});
