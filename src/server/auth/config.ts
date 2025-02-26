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
      name: string;
      username: string;
      image: string | null;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    username: string;
    name: string;
    image: string | null;
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
            image: true,
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
          image: user.image,
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
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const user = await db.query.users.findFirst({
          columns: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
          where: (tb, { eq }) => eq(tb.id, token.id as string),
        });
        if (!user) {
          throw new Error("Invalid credentials.");
        }
        session.user.id = user.id;
        session.user.username = user.username;
        session.user.name = user.name;
        session.user.image = user.image;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
