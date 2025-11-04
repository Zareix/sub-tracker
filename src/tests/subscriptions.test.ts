import { describe, expect, test } from "bun:test";
import { setMilliseconds, startOfDay } from "date-fns";
import { takeFirstOrThrow } from "~/lib/utils";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { subscriptions } from "~/server/db/schema";
import * as _mock from "./_mock";

const compareDates = (date1?: Date, date2?: Date) => {
	if (!date1 || !date2) {
		throw new Error(`One of the dates is undefined: ${date1}, ${date2}`);
	}
	const res =
		setMilliseconds(date1, 0).getTime() === setMilliseconds(date2, 0).getTime();
	expect(
		res,
		`Expected ${date1.toISOString()} to be equal to ${date2.toISOString()}`,
	).toBeTrue();
};

describe("Subscriptions", () => {
	const ctx = createInnerTRPCContext({ session: _mock.session });
	const caller = appRouter.createCaller({ ...ctx });

	test("Get default", async () => {
		// WHEN
		const results = await caller.subscription.getAll();

		// THEN
		expect(results).toHaveLength(1);
		const result = takeFirstOrThrow(results, "No subscription found");
		expect(result.name).toBe(_mock.subscription1.name);
		expect(result.price).toBe(_mock.subscription1.price);
		expect(result.originalPrice).toBe(_mock.subscription1.price);
		expect(result.schedule).toBe(_mock.subscription1.schedule);
		expect(result.description).toBe(_mock.subscription1.description);
		expect(result.currency).toBe(_mock.subscription1.currency);
		expect(result.users).toHaveLength(1);
		expect(result.users[0]).toMatchObject(_mock.user1);
		expect(result.category).toMatchObject(_mock.category1);
		expect(result.paymentMethod).toMatchObject(_mock.paymentMethod1);
		compareDates(result.firstPaymentDate, _mock.subscription1.firstPaymentDate);
		compareDates(result.nextPaymentDate, new Date("2020-06-14T00:00:00.000Z"));
		compareDates(
			result.secondNextPaymentDate,
			new Date("2020-07-14T00:00:00.000Z"),
		);
		compareDates(
			result.previousPaymentDate,
			new Date("2020-05-14T00:00:00.000Z"),
		);
	});

	test("Create", async () => {
		// GIVEN
		const newSubscription = {
			name: "New Subscription",
			description: "Description of new subscription",
			category: _mock.category1.id,
			price: 19.99,
			currency: "USD" as const,
			paymentMethod: _mock.paymentMethod1.id,
			firstPaymentDate: new Date("2024-06-01T00:00:00.000Z"),
			schedule: "Monthly" as const,
			payedBy: [_mock.user1.id],
			image: "https://example.com/image.png",
			url: "https://example.com",
		};

		// WHEN
		const subscription = await caller.subscription.create(newSubscription);

		// THEN
		const subscriptionDb = await ctx.db.query.subscriptions.findFirst({
			where: (tb, { eq }) => eq(tb.id, subscription.id),
		});
		expect(subscriptionDb).toBeDefined();
		if (!subscriptionDb) {
			return;
		}
		expect(subscriptionDb.name).toBe(newSubscription.name);
		expect(subscriptionDb.description).toBe(newSubscription.description);
		expect(subscriptionDb.category).toBe(newSubscription.category);
		expect(subscriptionDb.price).toBe(newSubscription.price);
		expect(subscriptionDb.currency).toBe(newSubscription.currency);
		expect(subscriptionDb.paymentMethod).toBe(newSubscription.paymentMethod);
		compareDates(
			startOfDay(subscriptionDb.firstPaymentDate),
			newSubscription.firstPaymentDate,
		);
		expect(subscriptionDb.schedule).toBe(newSubscription.schedule);
		expect(subscriptionDb.image).toBe(newSubscription.image);
		expect(subscriptionDb.url).toBe(newSubscription.url);
	});

	test("Delete", async () => {
		// GIVEN
		const newSubscription = {
			..._mock.subscription1,
			name: "Subscription to Delete",
			id: undefined,
		};
		const subscriptionId = takeFirstOrThrow(
			await ctx.db
				.insert(subscriptions)
				.values(newSubscription)
				.returning({ id: subscriptions.id }),
			"Could not insert subscription",
		).id;

		// WHEN
		await caller.subscription.delete(subscriptionId);

		// THEN
		const subscriptionDb = await ctx.db.query.subscriptions.findFirst({
			where: (tb, { eq }) => eq(tb.id, subscriptionId),
		});
		expect(subscriptionDb).toBeUndefined();
	});
});
