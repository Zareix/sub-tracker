import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import { db } from "~/server/db";
import { users } from "~/server/db/schema";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    username: string;
    // ...other properties
    // role: UserRole;
  }
}

export const authConfig = {
  providers: [
    Credentials({
      credentials: {
        username: {},
        password: {},
      },
      authorize: async (cres) => {
        const parsedCreds = z
          .object({
            username: z.string(),
            password: z.string(),
          })
          .safeParse(cres);

        if (!parsedCreds.success) {
          throw new Error("Invalid credentials");
        }

        const credentials = parsedCreds.data;

        const user = await db.query.users.findFirst({
          columns: {
            id: true,
            name: true,
            username: true,
            passwordHash: true,
          },
          where: (tb, { eq }) => eq(tb.username, credentials.username),
        });

        if (!user) {
          throw new Error("Invalid credentials.");
        }

        if (
          !(await Bun.password.verify(credentials.password, user.passwordHash))
        ) {
          throw new Error("Invalid credentials.");
        }

        return {
          id: user.id,
          name: user.name,
          username: user.username,
        };
      },
    }),
  ],
  adapter: DrizzleAdapter(db, {
    // @ts-expect-error Missing email field but we don't need it
    usersTable: users,
  }),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.name = token.name!;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
