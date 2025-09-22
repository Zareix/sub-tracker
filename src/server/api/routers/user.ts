import { TRPCError } from "@trpc/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { CURRENCIES } from "~/lib/constant";

import {
	adminProcedure,
	createTRPCRouter,
	protectedProcedure,
} from "~/server/api/trpc";
import { db, runTransaction } from "~/server/db";
import { subscriptions, users, usersToSubscriptions } from "~/server/db/schema";

export const userRouter = createTRPCRouter({
	getAll: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.query.users.findMany({
			columns: {
				id: true,
				name: true,
				email: true,
				image: true,
				role: true,
			},
			orderBy: [asc(users.name)],
		});
	}),
	updateBaseCurrency: protectedProcedure
		.input(
			z.object({
				baseCurrency: z.enum(CURRENCIES),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const usersReturned = await ctx.db
				.update(users)
				.set({
					baseCurrency: input.baseCurrency,
				})
				.where(eq(users.id, ctx.session.user.id))
				.returning({
					id: users.id,
				});
			const user = usersReturned[0];
			if (!user) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error updating base currency",
				});
			}
			return {
				id: user.id,
			};
		}),
	getProfile: protectedProcedure.query(async ({ ctx }) => {
		const user = await ctx.db.query.users.findFirst({
			where: (tb, { eq }) => eq(tb.id, ctx.session.user.id),
			columns: {
				id: true,
				name: true,
				email: true,
				image: true,
				role: true,
				baseCurrency: true,
			},
		});
		if (!user) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "User not found",
			});
		}
		return user;
	}),
	edit: adminProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string(),
				email: z.string().email(),
				image: z.string().nullish(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (ctx.session.user.id === input.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message:
						"You cannot edit your own user information through this endpoint.",
				});
			}
			const usersReturned = await ctx.db
				.update(users)
				.set({
					name: input.name,
					email: input.email,
					image: input.image,
				})
				.where(eq(users.id, input.id))
				.returning({
					id: users.id,
				});
			const user = usersReturned[0];
			if (!user) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error updating user",
				});
			}
			return {
				id: user.id,
			};
		}),
	delete: adminProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
		const user = await ctx.db.query.users.findFirst({
			where: (tb, { eq }) => eq(tb.id, input),
		});
		if (!user) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Error creating user",
			});
		}
		await runTransaction(db, async () => {
			const usersToSubscriptionsReturned = await db
				.delete(usersToSubscriptions)
				.where(eq(usersToSubscriptions.userId, input))
				.returning({
					subscriptionId: usersToSubscriptions.subscriptionId,
				});
			for (const userToSubscription of usersToSubscriptionsReturned) {
				await db
					.delete(subscriptions)
					.where(eq(subscriptions.id, userToSubscription.subscriptionId));
			}
			await db.delete(users).where(eq(users.id, input));
		});
		return {
			id: user.id,
			name: user.name,
			email: user.email,
		};
	}),
});
