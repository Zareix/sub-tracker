import { TRPCError } from "@trpc/server";
import { addMonths, addYears, endOfDay, isBefore } from "date-fns";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import {
	BASE_CURRENCY,
	CURRENCIES,
	type Currency,
	SCHEDULES,
} from "~/lib/constant";
import { rounded } from "~/lib/utils";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db, runTransaction } from "~/server/db";
import {
	type Category,
	type ExchangeRate,
	type PaymentMethod,
	type Subscription,
	type User,
	categories,
	paymentMethods,
	subscriptions,
	users,
	usersToSubscriptions,
} from "~/server/db/schema";
import { searchImages } from "~/server/services/google-search";

const convertToDefaultCurrency = (
	exchangeRates: Array<ExchangeRate>,
	price: number,
	baseCurrency: string,
	targetCurrency: Currency,
) => {
	if (baseCurrency === targetCurrency) {
		return price;
	}

	const exchangeRate = exchangeRates.find(
		(r) =>
			r.baseCurrency === baseCurrency && r.targetCurrency === targetCurrency,
	)?.rate;

	if (!exchangeRate) {
		return price;
	}

	return price * exchangeRate;
};

const calculateNextPaymentDate = (
	schedule: Subscription["schedule"],
	firstPaymentDate: Subscription["firstPaymentDate"],
) => {
	const firstPaymentDateDetails = {
		base: firstPaymentDate,
		year: firstPaymentDate.getFullYear(),
		month: firstPaymentDate.getMonth(),
		day: firstPaymentDate.getDate(),
	};
	const currentDateInfo = {
		base: new Date(),
		year: new Date().getFullYear(),
		month: new Date().getMonth(),
		day: new Date().getDate(),
	};

	if (firstPaymentDateDetails.base > currentDateInfo.base) {
		return firstPaymentDate;
	}

	switch (schedule) {
		case "Monthly": {
			const res = new Date(
				currentDateInfo.year,
				currentDateInfo.month,
				firstPaymentDateDetails.day,
				23,
				59,
				59,
			);
			if (res > currentDateInfo.base) {
				return res;
			}
			return addMonths(res, 1);
		}
		case "Yearly": {
			const res = new Date(
				currentDateInfo.year,
				firstPaymentDateDetails.month,
				firstPaymentDateDetails.day,
				23,
				59,
				59,
			);
			if (res > currentDateInfo.base) {
				return res;
			}
			return addYears(res, 1);
		}
	}
};

const calculateSecondNextPaymentDate = (
	schedule: Subscription["schedule"],
	nextPaymentDate: Date,
) => {
	switch (schedule) {
		case "Monthly":
			return addMonths(nextPaymentDate, 1);
		case "Yearly":
			return addYears(nextPaymentDate, 1);
	}
};

const calculatePreviousPaymentDate = (
	schedule: Subscription["schedule"],
	firstPaymentDate: Subscription["firstPaymentDate"],
	nextPaymentDate: Date,
) => {
	switch (schedule) {
		case "Yearly": {
			const previousPayment = addYears(nextPaymentDate, -1);
			if (isBefore(previousPayment, firstPaymentDate)) {
				return firstPaymentDate;
			}
			return previousPayment;
		}
		case "Monthly": {
			const previousPayment = addMonths(nextPaymentDate, -1);
			if (isBefore(previousPayment, firstPaymentDate)) {
				return firstPaymentDate;
			}
			return previousPayment;
		}
	}
};

export const subscriptionRouter = createTRPCRouter({
	getAll: protectedProcedure.query(async ({ ctx }) => {
		const [rows, exchangeRates] = await Promise.all([
			ctx.db
				.select()
				.from(subscriptions)
				.innerJoin(
					usersToSubscriptions,
					eq(subscriptions.id, usersToSubscriptions.subscriptionId),
				)
				.innerJoin(users, eq(usersToSubscriptions.userId, users.id))
				.innerJoin(
					paymentMethods,
					eq(subscriptions.paymentMethod, paymentMethods.id),
				)
				.innerJoin(categories, eq(subscriptions.category, categories.id))
				.orderBy(asc(subscriptions.name))
				.all(),
			ctx.db.query.exchangeRates.findMany(),
		]);

		return rows
			.reduce<
				Array<
					Omit<Subscription, "paymentMethod" | "category"> & {
						paymentMethod: PaymentMethod;
						category: Category;
						users: Array<User>;
					}
				>
			>((acc, row) => {
				const user = row.user;
				const subscription = row.subscription;
				const paymentMethod = row.payment_method;
				const category = row.category;

				const existingSubscription = acc.find((s) => s.id === subscription.id);
				if (existingSubscription) {
					existingSubscription.users.push(user);
					return acc;
				}

				acc.push({
					...subscription,
					users: [user],
					paymentMethod,
					category,
				});
				return acc;
			}, [])
			.map((subscription) => {
				const nextPaymentDate = calculateNextPaymentDate(
					subscription.schedule,
					subscription.firstPaymentDate,
				);
				const secondNextPaymentDate = calculateSecondNextPaymentDate(
					subscription.schedule,
					nextPaymentDate,
				);
				const previousPaymentDate = calculatePreviousPaymentDate(
					subscription.schedule,
					subscription.firstPaymentDate,
					nextPaymentDate,
				);
				return {
					...subscription,
					originalPrice: subscription.price,
					price: rounded(
						convertToDefaultCurrency(
							exchangeRates,
							subscription.price,
							subscription.currency,
							BASE_CURRENCY,
						),
					),
					nextPaymentDate,
					secondNextPaymentDate,
					previousPaymentDate,
				};
			});
	}),
	create: protectedProcedure
		.input(
			z.object({
				name: z.string(),
				description: z.string(),
				category: z.number(),
				image: z.string().optional(),
				price: z.number(),
				currency: z.enum(CURRENCIES),
				paymentMethod: z.number(),
				firstPaymentDate: z.date(),
				schedule: z.enum(SCHEDULES),
				payedBy: z.array(z.string()),
				url: z.string().url().optional(),
			}),
		)
		.mutation(async ({ input }) => {
			const subscription = await runTransaction(db, async () => {
				const subscriptionsReturned = await db
					.insert(subscriptions)
					.values({
						name: input.name,
						description: input.description,
						category: input.category,
						image: input.image,
						price: input.price,
						currency: input.currency,
						paymentMethod: input.paymentMethod,
						firstPaymentDate: endOfDay(input.firstPaymentDate),
						schedule: input.schedule,
						url: input.url,
					})
					.returning({
						id: subscriptions.id,
					});
				const subscription = subscriptionsReturned[0];
				if (!subscription) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Error creating subscription",
					});
				}
				await Promise.all(
					input.payedBy.map(async (payedBy) => {
						await db.insert(usersToSubscriptions).values({
							userId: payedBy,
							subscriptionId: subscription.id,
						});
					}),
				);
				return subscription;
			});

			return {
				id: subscription.id,
			};
		}),
	edit: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				name: z.string(),
				category: z.number(),
				description: z.string(),
				image: z.string().optional(),
				price: z.number(),
				currency: z.enum(CURRENCIES),
				paymentMethod: z.number(),
				firstPaymentDate: z.date(),
				schedule: z.enum(SCHEDULES),
				payedBy: z.array(z.string()),
				url: z.string().url().optional(),
			}),
		)
		.mutation(async ({ input }) => {
			const subscription = await runTransaction(db, async () => {
				const subscriptionsReturned = await db
					.update(subscriptions)
					.set({
						name: input.name,
						category: input.category,
						description: input.description,
						image: input.image,
						price: input.price,
						currency: input.currency,
						paymentMethod: input.paymentMethod,
						firstPaymentDate: endOfDay(input.firstPaymentDate),
						schedule: input.schedule,
						url: input.url,
					})
					.where(eq(subscriptions.id, input.id))
					.returning({
						id: subscriptions.id,
					});

				const subscription = subscriptionsReturned[0];
				if (!subscription) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Error creating subscription",
					});
				}

				await db
					.delete(usersToSubscriptions)
					.where(eq(usersToSubscriptions.subscriptionId, input.id));
				await Promise.all(
					input.payedBy.map((payedBy) =>
						db.insert(usersToSubscriptions).values({
							userId: payedBy,
							subscriptionId: subscription.id,
						}),
					),
				);
				return subscription;
			});

			return {
				id: subscription.id,
			};
		}),
	delete: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
		await runTransaction(db, async () => {
			await db
				.delete(usersToSubscriptions)
				.where(eq(usersToSubscriptions.subscriptionId, input));
			await db.delete(subscriptions).where(eq(subscriptions.id, input));
		});
	}),
	searchImages: protectedProcedure
		.input(z.object({ query: z.string() }))
		.query(({ input }) => {
			return searchImages(input.query);
		}),
});
