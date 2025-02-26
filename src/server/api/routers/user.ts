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
        username: true,
      },
      orderBy: [asc(users.name)],
    });
  }),
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        username: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const usersReturned = await ctx.db
        .insert(users)
        .values({
          name: input.name,
          username: input.username,
          passwordHash: await Bun.password.hash(input.password),
        })
        .returning({
          id: users.id,
          name: users.name,
          username: users.username,
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
        username: user.username,
      };
    }),
  edit: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        username: z.string(),
        password: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const usersReturned = await ctx.db
        .update(users)
        .set({
          name: input.name,
          username: input.username,
          passwordHash:
            input.password && input.password.length > 0
              ? await Bun.password.hash(input.password)
              : undefined,
        })
        .where(eq(users.id, input.id))
        .returning({
          id: users.id,
          name: users.name,
          username: users.username,
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
        username: user.username,
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
      username: user.username,
    };
  }),
});
