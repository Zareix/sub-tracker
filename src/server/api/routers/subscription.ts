import { TRPCError } from "@trpc/server";
import { addMonths, addYears, endOfDay, isBefore } from "date-fns";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import {
	Currencies,
	type Currency,
	DEFAULT_BASE_CURRENCY,
	SCHEDULES,
} from "~/lib/constant";
import { rounded, takeFirstOrNull } from "~/lib/utils";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { type db, runTransaction } from "~/server/db";
import {
	type Category,
	categories,
	type ExchangeRate,
	type PaymentMethod,
	paymentMethods,
	type Subscription,
	subscriptions,
	type User,
	users,
	usersToSubscriptions,
} from "~/server/db/schema";
import { searchImages } from "~/server/services/image-search";

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
		return endOfDay(firstPaymentDate);
	}

	switch (schedule) {
		case "Monthly": {
			const res = new Date(
				currentDateInfo.year,
				currentDateInfo.month,
				firstPaymentDateDetails.day,
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
				999,
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

export const getAllSubscriptionsOfUser = async (
	database: typeof db,
	userId: string,
	baseCurrency?: Currency,
) => {
	const [rows, exchangeRates] = await Promise.all([
		database
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
		database.query.exchangeRates.findMany(),
	]);

	const userBaseCurrency = baseCurrency ?? DEFAULT_BASE_CURRENCY;

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

			const existingSubscription = acc.find((s) => s.id === subscription.id);
			if (existingSubscription) {
				existingSubscription.users.push(user);
				return acc;
			}

			acc.push({
				...subscription,
				users: [user],
				paymentMethod: row.payment_method,
				category: row.category,
			});
			return acc;
		}, [])
		.filter((subscription) =>
			subscription.users.some((user) => user.id === userId),
		)
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
						userBaseCurrency,
					),
				),
				nextPaymentDate,
				secondNextPaymentDate,
				previousPaymentDate,
			};
		});
};

export const subscriptionRouter = createTRPCRouter({
	getAll: protectedProcedure.query(async ({ ctx }) => {
		const baseCurrency = ctx.session.user.baseCurrency;
		const userId = ctx.session.user.id;
		return getAllSubscriptionsOfUser(ctx.db, userId, baseCurrency);
	}),
	create: protectedProcedure
		.input(
			z.object({
				name: z.string(),
				description: z.string(),
				category: z.number(),
				image: z.string().optional(),
				price: z.number(),
				currency: z.enum(Currencies),
				paymentMethod: z.number(),
				firstPaymentDate: z.date(),
				schedule: z.enum(SCHEDULES),
				payedBy: z.array(z.string()),
				url: z.url().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const subscription = await runTransaction(ctx.db, async (db) => {
				const subscription = takeFirstOrNull(
					await db
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
						}),
				);
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
				currency: z.enum(Currencies),
				paymentMethod: z.number(),
				firstPaymentDate: z.date(),
				schedule: z.enum(SCHEDULES),
				payedBy: z.array(z.string()),
				url: z.url().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const subscription = await runTransaction(ctx.db, async (db) => {
				const subscription = takeFirstOrNull(
					await db
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
						}),
				);
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
	delete: protectedProcedure
		.input(z.number())
		.mutation(async ({ ctx, input }) => {
			await runTransaction(ctx.db, async (db) => {
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
