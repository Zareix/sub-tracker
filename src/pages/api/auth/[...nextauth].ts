import NextAuth from "next-auth";

import { authConfig } from "~/server/auth";

export default NextAuth(authConfig);
