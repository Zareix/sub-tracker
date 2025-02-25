import { exchangeRates } from "./../../db/schema";
import { TRPCError } from "@trpc/server";
import { addMonths, addYears } from "date-fns";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { BASE_CURRENCY, CURRENCIES, type Currency } from "~/lib/constant";
import { rounded } from "~/lib/utils";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  categories,
  type Category,
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

const calculateNextPaymentDate = (
  schedule: Subscription["schedule"],
  firstPaymentDate: Subscription["firstPaymentDate"],
) => {
  const firstPaymentDateDetails = {
    base: firstPaymentDate,
    year: firstPaymentDate.getFullYear(),
    month: firstPaymentDate.getMonth(),
    day: firstPaymentDate.getDate(),
  };
  const currentDateInfo = {
    base: new Date(),
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    day: new Date().getDate(),
  };

  if (firstPaymentDateDetails.base > currentDateInfo.base) {
    return firstPaymentDate;
  }

  if (schedule === "Monthly") {
    const res = new Date(
      currentDateInfo.year,
      currentDateInfo.month,
      firstPaymentDateDetails.day,
    );
    if (res > currentDateInfo.base) {
      return res;
    }
    return addMonths(firstPaymentDate, 1);
  }

  if (schedule === "Yearly") {
    const res = new Date(
      currentDateInfo.year,
      firstPaymentDateDetails.month,
      firstPaymentDateDetails.day,
    );
    if (res > currentDateInfo.base) {
      return res;
    }
    return addYears(res, 1);
  }

  return new Date();
};

export const subscriptionRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const [rows, exchangeRates] = await Promise.all([
      ctx.db
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
        .innerJoin(categories, eq(subscriptions.category, categories.id))
        .orderBy(asc(subscriptions.name))
        .all(),
      ctx.db.query.exchangeRates.findMany(),
    ]);

    return rows
      .reduce<
        Array<
          Omit<Subscription, "paymentMethod" | "category"> & {
            paymentMethod: PaymentMethod;
            category: Category;
            users: Array<User>;
          }
        >
      >((acc, row) => {
        const user = row.user;
        const subscription = row.subscription;
        const paymentMethod = row.payment_method;
        const category = row.category;

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
            category,
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
        nextPaymentDate: calculateNextPaymentDate(
          subscription.schedule,
          subscription.firstPaymentDate,
        ),
      }));
  }),
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        category: z.number(),
        image: z.string().optional(),
        price: z.number(),
        currency: z.enum(CURRENCIES),
        paymentMethod: z.number(),
        firstPaymentDate: z.date(),
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
            category: input.category,
            image: input.image,
            price: input.price,
            currency: input.currency,
            paymentMethod: input.paymentMethod,
            firstPaymentDate: input.firstPaymentDate,
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
        await Promise.all(
          input.payedBy.map(async (payedBy) => {
            await trx.insert(usersToSubscriptions).values({
              userId: payedBy,
              subscriptionId: subscription.id,
            });
          }),
        );
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
        category: z.number(),
        description: z.string(),
        image: z.string().optional(),
        price: z.number(),
        currency: z.enum(CURRENCIES),
        paymentMethod: z.number(),
        firstPaymentDate: z.date(),
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
            category: input.category,
            description: input.description,
            image: input.image,
            price: input.price,
            currency: input.currency,
            paymentMethod: input.paymentMethod,
            firstPaymentDate: input.firstPaymentDate,
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
        await Promise.all(
          input.payedBy.map((payedBy) =>
            trx.insert(usersToSubscriptions).values({
              userId: payedBy,
              subscriptionId: subscription.id,
            }),
          ),
        );
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
