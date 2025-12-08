import { TRPCError } from "@trpc/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { takeFirstOrThrow } from "~/lib/utils";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { runTransaction } from "~/server/db";
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
		.input(
			z.object({
				name: z.string().min(1, "Name cannot be empty"),
				image: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const paymentMethod = takeFirstOrThrow(
				await ctx.db
					.insert(paymentMethods)
					.values({
						name: input.name,
						image: input.image,
					})
					.returning({
						id: paymentMethods.id,
					}),
				new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error creating paymentMethod",
				}),
			);
			return {
				id: paymentMethod.id,
			};
		}),
	edit: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				name: z.string(),
				image: z.string().nullish(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const paymentMethod = takeFirstOrThrow(
				await ctx.db
					.update(paymentMethods)
					.set({
						name: input.name,
						image: input.image ?? null,
					})
					.where(eq(paymentMethods.id, input.id))
					.returning({
						id: paymentMethods.id,
					}),
				new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error creating paymentMethod",
				}),
			);
			return {
				id: paymentMethod.id,
			};
		}),
	delete: protectedProcedure
		.input(z.number())
		.mutation(async ({ ctx, input }) => {
			await runTransaction(ctx.db, async (db) => {
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
				success: true,
			};
		}),
});
