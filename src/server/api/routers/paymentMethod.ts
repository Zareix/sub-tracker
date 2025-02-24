import { TRPCError } from "@trpc/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  paymentMethods,
  subscriptions,
  usersToSubscriptions,
} from "~/server/db/schema";

export const paymentMethodRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.paymentMethods.findMany({
      orderBy: [asc(paymentMethods.name)],
    });
  }),
  create: publicProcedure
    .input(z.object({ name: z.string(), image: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const paymentMethodsReturned = await ctx.db
        .insert(paymentMethods)
        .values({
          name: input.name,
          image: input.image,
        })
        .returning({
          id: paymentMethods.id,
        });
      const paymentMethod = paymentMethodsReturned[0];
      if (!paymentMethod) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error creating paymentMethod",
        });
      }
      return {
        id: paymentMethod.id,
      };
    }),
  edit: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        image: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const paymentMethodsReturned = await ctx.db
        .update(paymentMethods)
        .set({
          name: input.name,
          image: input.image,
        })
        .where(eq(paymentMethods.id, input.id))
        .returning({
          id: paymentMethods.id,
        });
      const paymentMethod = paymentMethodsReturned[0];
      if (!paymentMethod) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error creating paymentMethod",
        });
      }
      return {
        id: paymentMethod.id,
      };
    }),
  delete: publicProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
    await ctx.db.transaction(async (trx) => {
      const subs = await trx
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.paymentMethod, input));
      for (const sub of subs) {
        await trx
          .delete(usersToSubscriptions)
          .where(eq(usersToSubscriptions.subscriptionId, sub.id));
        await trx.delete(subscriptions).where(eq(subscriptions.id, sub.id));
      }
      await trx.delete(paymentMethods).where(eq(paymentMethods.id, input));
    });
    return {
      id: input,
    };
  }),
});
