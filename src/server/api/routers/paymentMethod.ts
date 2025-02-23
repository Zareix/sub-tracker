import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { paymentMethods } from "~/server/db/schema";

export const paymentMethodRouter = createTRPCRouter({
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.db.query.paymentMethods.findMany();
    }),
  create: publicProcedure
    .input(z.object({ name: z.string()}))
    .mutation(async ({ ctx, input }) => {
      const paymentMethodsReturned = await ctx.db.insert(paymentMethods)
      .values({
        name: input.name,
      }).returning({
        id: paymentMethods.id,
      });
      const paymentMethod = paymentMethodsReturned[0]
      if (!paymentMethod) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error creating paymentMethod" });
      }
      return {
        id: paymentMethod.id,
      };
    }),
});
