import { z } from "zod";
import { CURRENCIES, SCHEDULES, UserRoles } from "~/lib/constant";
import { preprocessStringToDate } from "~/lib/utils";

import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";
import { db, runTransaction } from "~/server/db";
import {
  categories,
  paymentMethods,
  subscriptions,
  users,
  usersToSubscriptions,
} from "~/server/db/schema";
import { updateExchangeRates } from "~/server/services/exchange-rates";
import { cleanUpFiles } from "~/server/services/files";

export const adminRouter = createTRPCRouter({
  cleanUpFiles: adminProcedure.mutation(async ({ ctx }) => {
    let filesInUse = (
      await ctx.db.query.subscriptions.findMany({
        columns: {
          image: true,
        },
        where: (tb, { isNotNull }) => isNotNull(tb.image),
      })
    ).map((subscription) => subscription.image);
    filesInUse = filesInUse.concat(
      (
        await ctx.db.query.paymentMethods.findMany({
          columns: {
            image: true,
          },
          where: (tb, { isNotNull }) => isNotNull(tb.image),
        })
      ).map((paymentMethod) => paymentMethod.image),
    );

    filesInUse = filesInUse
      .filter(Boolean)
      .map((file) => file.replace("/api/files?filename=", ""));

    await cleanUpFiles(filesInUse);
  }),
  updateExchangeRates: adminProcedure.mutation(async () => {
    await updateExchangeRates();
  }),
  exportData: adminProcedure.mutation(async ({ ctx }) => {
    const subscriptions = await ctx.db.query.subscriptions.findMany();
    const paymentMethods = await ctx.db.query.paymentMethods.findMany();
    const categories = await ctx.db.query.categories.findMany();
    const users = await ctx.db.query.users.findMany();
    const userToSubscriptions =
      await ctx.db.query.usersToSubscriptions.findMany();

    return {
      subscriptions,
      paymentMethods,
      categories,
      users,
      userToSubscriptions,
    };
  }),
  importData: adminProcedure
    .input(
      z.object({
        subscriptions: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
            category: z.number(),
            image: z.string().nullish(),
            description: z.string(),
            price: z.number(),
            currency: z.enum(CURRENCIES),
            paymentMethod: z.number(),
            schedule: z.enum(SCHEDULES),
            firstPaymentDate: z.preprocess(preprocessStringToDate, z.date()),
            createdAt: z.preprocess(preprocessStringToDate, z.date()),
            updatedAt: z.preprocess(preprocessStringToDate, z.date()),
          }),
        ),
        paymentMethods: z
          .array(
            z.object({
              id: z.number(),
              name: z.string(),
              image: z.string().nullish(),
            }),
          )
          .optional(),
        categories: z
          .array(
            z.object({
              id: z.number(),
              name: z.string(),
              icon: z.string(),
            }),
          )
          .optional(),
        users: z
          .array(
            z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
              role: z.enum(UserRoles),
              emailVerified: z.boolean(),
              image: z.string().nullish(),
              createdAt: z.preprocess(preprocessStringToDate, z.date()),
              updatedAt: z.preprocess(preprocessStringToDate, z.date()),
            }),
          )
          .optional(),
        userToSubscriptions: z
          .array(
            z.object({
              userId: z.string(),
              subscriptionId: z.number(),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ input }) => {
      await runTransaction(db, async () => {
        if (input.users && input.users.length > 0) {
          await db.insert(users).values(input.users);
        }
        if (input.paymentMethods && input.paymentMethods.length > 0) {
          await db.insert(paymentMethods).values(input.paymentMethods);
        }
        if (input.categories && input.categories.length > 0) {
          await db.insert(categories).values(input.categories);
        }
        if (input.subscriptions && input.subscriptions.length > 0) {
          await db.insert(subscriptions).values(input.subscriptions);
        }
        if (input.userToSubscriptions && input.userToSubscriptions.length > 0) {
          await db
            .insert(usersToSubscriptions)
            .values(input.userToSubscriptions);
        }
      });
    }),
});
