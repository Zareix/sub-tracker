import { TRPCError } from "@trpc/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db, runTransaction } from "~/server/db";
import {
	paymentMethods,
	subscriptions,
	usersToSubscriptions,
} from "~/server/db/schema";

export const paymentMethodRouter = createTRPCRouter({
	getAll: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.query.paymentMethods.findMany({
			orderBy: [asc(paymentMethods.name)],
		});
	}),
	create: protectedProcedure
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
	edit: protectedProcedure
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
	delete: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
		await runTransaction(db, async () => {
			const subs = await db
				.select()
				.from(subscriptions)
				.where(eq(subscriptions.paymentMethod, input));
			for (const sub of subs) {
				await db
					.delete(usersToSubscriptions)
					.where(eq(usersToSubscriptions.subscriptionId, sub.id));
				await db.delete(subscriptions).where(eq(subscriptions.id, sub.id));
			}
			await db.delete(paymentMethods).where(eq(paymentMethods.id, input));
		});
		return {
			id: input,
		};
	}),
});
