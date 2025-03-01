import { GetServerSidePropsContext } from "next";
import {
  type NextAuthOptions,
  type DefaultSession,
  getServerSession,
} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import type { UserRole } from "~/lib/constant";

import { db } from "~/server/db";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name: string;
      username: string;
      image: string | null;
      role: UserRole;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    username: string;
    name: string;
    image: string | null;
    role: UserRole;
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
            role: true,
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
          role: user.role,
        };
      },
    }),
  ],
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
        token.role = user.role;
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
            role: true,
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
        session.user.role = user.role;
      }
      return session;
    },
  },
} satisfies NextAuthOptions;

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authConfig);
};
