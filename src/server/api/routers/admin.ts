import { readdir } from "node:fs/promises";
import { z } from "zod";
import { env } from "~/env";
import { CURRENCIES, SCHEDULES, UserRoles } from "~/lib/constant";
import { preprocessStringToDate } from "~/lib/utils";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  categories,
  paymentMethods,
  subscriptions,
  users,
  usersToSubscriptions,
} from "~/server/db/schema";
import { updateExchangeRates } from "~/server/services/exchange-rates";

export const adminRouter = createTRPCRouter({
  cleanUpFiles: protectedProcedure.mutation(async ({ ctx }) => {
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

    for (const file of await readdir(env.UPLOADS_FOLDER)) {
      if (!filesInUse.includes(file)) {
        console.log("Deleting file", file);
        await Bun.file(`${env.UPLOADS_FOLDER}/${file}`).delete();
      }
    }
  }),
  updateExchangeRates: protectedProcedure.mutation(async () => {
    await updateExchangeRates();
  }),
  exportData: protectedProcedure.mutation(async ({ ctx }) => {
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
  importData: protectedProcedure
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
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction(async (trx) => {
        if (input.users && input.users.length > 0) {
          await trx.insert(users).values(input.users);
        }
        if (input.paymentMethods && input.paymentMethods.length > 0) {
          await trx.insert(paymentMethods).values(input.paymentMethods);
        }
        if (input.categories && input.categories.length > 0) {
          await trx.insert(categories).values(input.categories);
        }
        if (input.subscriptions && input.subscriptions.length > 0) {
          await trx.insert(subscriptions).values(input.subscriptions);
        }
        if (input.userToSubscriptions && input.userToSubscriptions.length > 0) {
          await trx
            .insert(usersToSubscriptions)
            .values(input.userToSubscriptions);
        }
      });
    }),
});
