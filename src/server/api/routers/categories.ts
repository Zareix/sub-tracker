import { TRPCError } from "@trpc/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db, runTransaction } from "~/server/db";
import {
	categories,
	subscriptions,
	usersToSubscriptions,
} from "~/server/db/schema";

export const categoryRouter = createTRPCRouter({
	getAll: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.query.categories.findMany({
			columns: {
				id: true,
				name: true,
				icon: true,
			},
			orderBy: [asc(categories.name)],
		});
	}),
	create: protectedProcedure
		.input(z.object({ name: z.string(), icon: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const categoriesReturned = await ctx.db
				.insert(categories)
				.values({
					name: input.name,
					icon: input.icon,
				})
				.returning({
					id: categories.id,
					name: categories.name,
					icon: categories.icon,
				});
			const category = categoriesReturned[0];
			if (!category) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error creating category",
				});
			}
			return {
				id: category.id,
				name: category.name,
				icon: category.icon,
			};
		}),
	edit: protectedProcedure
		.input(z.object({ id: z.number(), name: z.string(), icon: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const categoriesReturned = await ctx.db
				.update(categories)
				.set({
					name: input.name,
					icon: input.icon,
				})
				.where(eq(categories.id, input.id))
				.returning({
					id: categories.id,
					name: categories.name,
					icon: categories.icon,
				});
			const category = categoriesReturned[0];
			if (!category) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error updating category",
				});
			}
			return {
				id: category.id,
				name: category.name,
				icon: category.icon,
			};
		}),
	delete: protectedProcedure
		.input(z.number())
		.mutation(async ({ ctx, input }) => {
			if (input === 1) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Cannot delete default category",
				});
			}
			const category = await ctx.db.query.categories.findFirst({
				where: (tb, { eq }) => eq(tb.id, input),
			});
			if (!category) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error creating category",
				});
			}
			await runTransaction(db, async () => {
				const subs = await db
					.select()
					.from(subscriptions)
					.where(eq(subscriptions.category, input));
				for (const sub of subs) {
					await db
						.delete(usersToSubscriptions)
						.where(eq(usersToSubscriptions.subscriptionId, sub.id));
					await db.delete(subscriptions).where(eq(subscriptions.id, sub.id));
				}
				await db.delete(categories).where(eq(categories.id, input));
			});
			return {
				id: category.id,
				name: category.name,
				icon: category.icon,
			};
		}),
});
