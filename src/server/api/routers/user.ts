import { TRPCError } from "@trpc/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { UserRoles } from "~/lib/constant";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { subscriptions, users, usersToSubscriptions } from "~/server/db/schema";

export const userRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.users.findMany({
      columns: {
        id: true,
        name: true,
        username: true,
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
        username: z.string(),
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
          username: input.username,
          passwordHash: await Bun.password.hash(input.password),
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
        username: z.string(),
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
          username: input.username,
          passwordHash:
            input.password && input.password.length > 0
              ? await Bun.password.hash(input.password)
              : undefined,
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
