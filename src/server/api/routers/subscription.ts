import { TRPCError } from "@trpc/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { BASE_CURRENCY, CURRENCIES, type Currency } from "~/lib/constant";
import { rounded } from "~/lib/utils";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  type ExchangeRate,
  type PaymentMethod,
  paymentMethods,
  type Subscription,
  subscriptions,
  type User,
  users,
  usersToSubscriptions,
} from "~/server/db/schema";

const convertToDefaultCurrency = (
  exchangeRates: Array<ExchangeRate>,
  price: number,
  baseCurrency: string,
  targetCurrency: Currency,
) => {
  if (baseCurrency === targetCurrency) {
    return price;
  }

  const exchangeRate = exchangeRates.find(
    (r) =>
      r.baseCurrency === baseCurrency && r.targetCurrency === targetCurrency,
  )?.rate;

  if (!exchangeRate) {
    return price;
  }

  return price * exchangeRate;
};

export const subscriptionRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
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
      .orderBy(asc(subscriptions.name))
      .all();

    const exchangeRates = await ctx.db.query.exchangeRates.findMany();

    return rows
      .reduce<
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
      }, [])
      .map((subscription) => ({
        ...subscription,
        originalPrice: subscription.price,
        price: rounded(
          convertToDefaultCurrency(
            exchangeRates,
            subscription.price,
            subscription.currency,
            BASE_CURRENCY,
          ),
        ),
      }));
  }),
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        image: z.string().optional(),
        price: z.number(),
        currency: z.enum(CURRENCIES),
        paymentMethod: z.number(),
        schedule: z.string(),
        payedBy: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const subscription = await ctx.db.transaction(async (trx) => {
        const subscriptionsReturned = await trx
          .insert(subscriptions)
          .values({
            name: input.name,
            description: input.description,
            image: input.image,
            price: input.price,
            currency: input.currency,
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
          await trx.insert(usersToSubscriptions).values({
            userId: payedBy,
            subscriptionId: subscription.id,
          });
        }
        return subscription;
      });

      return {
        id: subscription.id,
      };
    }),
  edit: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        description: z.string(),
        image: z.string().optional(),
        price: z.number(),
        currency: z.enum(CURRENCIES),
        paymentMethod: z.number(),
        schedule: z.string(),
        payedBy: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const subscription = await ctx.db.transaction(async (trx) => {
        const subscriptionsReturned = await trx
          .update(subscriptions)
          .set({
            name: input.name,
            description: input.description,
            image: input.image,
            price: input.price,
            currency: input.currency,
            paymentMethod: input.paymentMethod,
            schedule: input.schedule,
          })
          .where(eq(subscriptions.id, input.id))
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

        await trx
          .delete(usersToSubscriptions)
          .where(eq(usersToSubscriptions.subscriptionId, input.id));
        for (const payedBy of input.payedBy) {
          await trx.insert(usersToSubscriptions).values({
            userId: payedBy,
            subscriptionId: subscription.id,
          });
        }
        return subscription;
      });

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
