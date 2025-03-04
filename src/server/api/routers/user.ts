import { TRPCError } from "@trpc/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { UserRoles } from "~/lib/constant";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { auth } from "~/server/auth";
import { db, runTransaction } from "~/server/db";
import { subscriptions, users, usersToSubscriptions } from "~/server/db/schema";

export const userRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.users.findMany({
      columns: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
      orderBy: [asc(users.name)],
    });
  }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string(),
        role: z.enum(UserRoles),
        image: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const usersReturned = await ctx.db
        .insert(users)
        .values({
          name: input.name,
          email: input.email,
          image: input.image,
          role: input.role,
        })
        .returning({
          id: users.id,
        });
      const user = usersReturned[0];
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error creating user",
        });
      }
      return {
        id: user.id,
      };
    }),
  edit: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string().email(),
        password: z.string().optional(),
        role: z.enum(UserRoles),
        image: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const usersReturned = await ctx.db
        .update(users)
        .set({
          name: input.name,
          email: input.email,
          image: input.image,
          role: ctx.session.user.role === "admin" ? input.role : undefined,
        })
        .where(eq(users.id, input.id))
        .returning({
          id: users.id,
        });
      const user = usersReturned[0];
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error updating user",
        });
      }
      if (ctx.session.user.role === "admin" && input.password) {
        const ctx = await auth.$context;
        const hash = await ctx.password.hash(input.password);
        await ctx.internalAdapter.updatePassword(user.id, hash);
      }
      return {
        id: user.id,
      };
    }),
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (tb, { eq }) => eq(tb.id, input),
      });
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error creating user",
        });
      }
      await runTransaction(db, async () => {
        const usersToSubscriptionsReturned = await db
          .delete(usersToSubscriptions)
          .where(eq(usersToSubscriptions.userId, input))
          .returning({
            subscriptionId: usersToSubscriptions.subscriptionId,
          });
        for (const userToSubscription of usersToSubscriptionsReturned) {
          await db
            .delete(subscriptions)
            .where(eq(subscriptions.id, userToSubscription.subscriptionId));
        }
        await db.delete(users).where(eq(users.id, input));
      });
      return {
        id: user.id,
        name: user.name,
        email: user.email,
      };
    }),
});
