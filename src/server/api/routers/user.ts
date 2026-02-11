import { TRPCError } from "@trpc/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { env } from "~/env";
import type { AuthProvider } from "~/lib/auth-client";
import { takeFirstOrThrow } from "~/lib/utils";
import {
	adminProcedure,
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";
import { runTransaction } from "~/server/db";
import { subscriptions, users, usersToSubscriptions } from "~/server/db/schema";

export const userRouter = createTRPCRouter({
	authProviders: publicProcedure.query(async () => {
		const providers: AuthProvider[] = ["password", "passkey"];
		if (env.OAUTH_ENABLED) {
			providers.push(`oauth-${env.OAUTH_PROVIDER_ID}`);
		}
		return providers;
	}),
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
	edit: adminProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string(),
				email: z.email(),
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
			const user = takeFirstOrThrow(
				await ctx.db
					.update(users)
					.set({
						name: input.name,
						email: input.email,
						image: input.image,
					})
					.where(eq(users.id, input.id))
					.returning({
						id: users.id,
					}),
				new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error updating user",
				}),
			);
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
		await runTransaction(ctx.db, async (db) => {
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
