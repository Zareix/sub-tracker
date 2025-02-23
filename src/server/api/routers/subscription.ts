import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { filtersSchema } from "~/server/api/routers/schema";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  PaymentMethod,
  paymentMethods,
  type Subscription,
  subscriptions,
  type User,
  users,
  usersToSubscriptions,
} from "~/server/db/schema";

export const subscriptionRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx, input }) => {
    const rows = ctx.db
      .select()
      .from(subscriptions)
      .innerJoin(
        usersToSubscriptions,
        eq(subscriptions.id, usersToSubscriptions.subscriptionId),
      )
      .innerJoin(users, eq(usersToSubscriptions.userId, users.id))
      .innerJoin(
        paymentMethods,
        eq(subscriptions.paymentMethod, paymentMethods.id),
      )
      .all();

    return rows.reduce<
      Array<
        Omit<Subscription, "paymentMethod"> & {
          paymentMethod: PaymentMethod;
          users: Array<User>;
        }
      >
    >((acc, row) => {
      const user = row.user;
      const subscription = row.subscription;
      const paymentMethod = row.payment_method;

      const existingSubscription = acc.find((s) => s.id === subscription.id);

      if (existingSubscription) {
        existingSubscription.users.push(user);
        return acc;
      }

      return [
        ...acc,
        {
          ...subscription,
          users: [user],
          paymentMethod,
        },
      ];
    }, []);
  }),
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        price: z.number(),
        paymentMethod: z.string(),
        schedule: z.string(),
        payedBy: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const subscriptionsReturned = await ctx.db
        .insert(subscriptions)
        .values({
          name: input.name,
          price: input.price,
          paymentMethod: input.paymentMethod,
          schedule: input.schedule,
        })
        .returning({
          id: subscriptions.id,
        });
      const subscription = subscriptionsReturned[0];
      if (!subscription) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error creating subscription",
        });
      }
      for (const payedBy of input.payedBy) {
        await ctx.db.insert(usersToSubscriptions).values({
          userId: payedBy,
          subscriptionId: subscription.id,
        });
      }
      return {
        id: subscription.id,
      };
    }),
  delete: publicProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
    await ctx.db.transaction(async (trx) => {
      await trx
        .delete(usersToSubscriptions)
        .where(eq(usersToSubscriptions.subscriptionId, input));
      await trx.delete(subscriptions).where(eq(subscriptions.id, input));
    });
  }),
});
