import { TRPCError } from "@trpc/server";
import { asc, eq } from "drizzle-orm";
import { dynamicIconImports } from "lucide-react/dynamic";
import { z } from "zod";
import { takeFirstOrThrow } from "~/lib/utils";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { runTransaction } from "~/server/db";
import { categories, subscriptions } from "~/server/db/schema";

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
		.input(
			z.object({
				name: z.string().min(1, "Name cannot be empty"),
				icon: z.enum(Object.keys(dynamicIconImports), "Invalid icon"),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const category = takeFirstOrThrow(
				await ctx.db
					.insert(categories)
					.values({
						name: input.name,
						icon: input.icon,
					})
					.returning({
						id: categories.id,
						name: categories.name,
						icon: categories.icon,
					}),
				new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error creating category",
				}),
			);
			return {
				id: category.id,
				name: category.name,
				icon: category.icon,
			};
		}),
	edit: protectedProcedure
		.input(z.object({ id: z.number(), name: z.string(), icon: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const category = takeFirstOrThrow(
				await ctx.db
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
					}),
				new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error updating category",
				}),
			);
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
			await runTransaction(ctx.db, async (db) => {
				await db
					.update(subscriptions)
					.set({ category: 1 })
					.where(eq(subscriptions.category, input));
				await db.delete(categories).where(eq(categories.id, input));
			});
			return {
				success: true,
			};
		}),
});
