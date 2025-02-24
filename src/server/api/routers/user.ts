import { TRPCError } from "@trpc/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { subscriptions, users, usersToSubscriptions } from "~/server/db/schema";

export const userRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.users.findMany({
      columns: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: [asc(users.name)],
    });
  }),
  create: publicProcedure
    .input(z.object({ name: z.string(), email: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const usersReturned = await ctx.db
        .insert(users)
        .values({
          name: input.name,
          email: input.email,
        })
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
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
        name: user.name,
        email: user.email,
      };
    }),
  edit: publicProcedure
    .input(z.object({ id: z.string(), name: z.string(), email: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const usersReturned = await ctx.db
        .update(users)
        .set({
          name: input.name,
          email: input.email,
        })
        .where(eq(users.id, input.id))
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
        });
      const user = usersReturned[0];
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error updating user",
        });
      }
      return {
        id: user.id,
        name: user.name,
        email: user.email,
      };
    }),
  delete: publicProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    const user = await ctx.db.query.users.findFirst({
      where: (tb, { eq }) => eq(tb.id, input),
    });
    if (!user) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error creating user",
      });
    }
    await ctx.db.transaction(async (trx) => {
      const usersToSubscriptionsReturned = await trx
        .delete(usersToSubscriptions)
        .where(eq(usersToSubscriptions.userId, input))
        .returning({
          subscriptionId: usersToSubscriptions.subscriptionId,
        });
      for (const userToSubscription of usersToSubscriptionsReturned) {
        await trx
          .delete(subscriptions)
          .where(eq(subscriptions.id, userToSubscription.subscriptionId));
      }
      await trx.delete(users).where(eq(users.id, input));
    });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }),
});
