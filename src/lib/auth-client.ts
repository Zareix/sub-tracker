import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "~/server/auth";

import { env } from "~/env";

export const { signIn, signUp, useSession, signOut } = createAuthClient({
  // baseURL: env.NEXT_PUBLIC_AUTH_URL,
  plugins: [inferAdditionalFields<typeof auth>()],
});
