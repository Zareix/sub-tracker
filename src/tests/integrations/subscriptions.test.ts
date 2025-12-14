import { describe, expect, test } from "bun:test";
import { setMilliseconds, startOfDay } from "date-fns";
import { takeFirstOrThrow } from "~/lib/utils";
import { subscriptions } from "~/server/db/schema";
import * as _mock from "~/tests/integrations/_mock";
import { createTestCaller } from "~/tests/integrations/_utils";

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

describe("Subscriptions", async () => {
	const [caller, ctx] = await createTestCaller();

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

	describe("Edit", () => {
		test("all fields", async () => {
			// GIVEN
			const originalSubscription = await ctx.db.query.subscriptions.findFirst({
				where: (tb, { eq }) => eq(tb.id, _mock.subscription1.id),
			});
			expect(originalSubscription).toBeDefined();

			const updated = {
				id: _mock.subscription1.id,
				name: "Updated Netflix",
				description: "Updated description",
				category: _mock.category2.id,
				price: 29.99,
				currency: "EUR" as const,
				paymentMethod: _mock.paymentMethod2.id,
				firstPaymentDate: new Date("2024-07-01T00:00:00.000Z"),
				schedule: "Yearly" as const,
				payedBy: [_mock.user1.id],
				image: "https://example.com/updated-image.png",
				url: "https://updated.example.com",
			};

			// WHEN
			const result = await caller.subscription.edit(updated);

			// THEN
			expect(result).toHaveProperty("id", updated.id);
			const subscriptionDb = await ctx.db.query.subscriptions.findFirst({
				where: (tb, { eq }) => eq(tb.id, updated.id),
			});
			expect(subscriptionDb).toBeDefined();
			if (!subscriptionDb) {
				return;
			}
			expect(subscriptionDb.name).toBe(updated.name);
			expect(subscriptionDb.description).toBe(updated.description);
			expect(subscriptionDb.category).toBe(updated.category);
			expect(subscriptionDb.price).toBe(updated.price);
			expect(subscriptionDb.currency).toBe(updated.currency);
			expect(subscriptionDb.paymentMethod).toBe(updated.paymentMethod);
			compareDates(
				startOfDay(subscriptionDb.firstPaymentDate),
				updated.firstPaymentDate,
			);
			expect(subscriptionDb.schedule).toBe(updated.schedule);
			expect(subscriptionDb.image).toBe(updated.image);
			expect(subscriptionDb.url).toBe(updated.url);
		});

		test("without optional fields", async () => {
			// GIVEN
			const updated = {
				id: _mock.subscription1.id,
				name: "Updated Name Only",
				description: "Updated description only",
				category: _mock.category1.id,
				price: 15.99,
				currency: "USD" as const,
				paymentMethod: _mock.paymentMethod1.id,
				firstPaymentDate: new Date("2024-05-15T00:00:00.000Z"),
				schedule: "Monthly" as const,
				payedBy: [_mock.user1.id],
			};

			// WHEN
			const result = await caller.subscription.edit(updated);

			// THEN
			expect(result).toHaveProperty("id", updated.id);
			const subscriptionDb = await ctx.db.query.subscriptions.findFirst({
				where: (tb, { eq }) => eq(tb.id, updated.id),
			});
			expect(subscriptionDb).toBeDefined();
			if (!subscriptionDb) {
				return;
			}
			expect(subscriptionDb.name).toBe(updated.name);
			expect(subscriptionDb.description).toBe(updated.description);
			expect(subscriptionDb.price).toBe(updated.price);
		});

		test("without creator in payedBy fails", async () => {
			// GIVEN
			const updated = {
				id: _mock.subscription1.id,
				name: "Should Fail",
				description: "This should fail",
				category: _mock.category1.id,
				price: 10.0,
				currency: "USD" as const,
				paymentMethod: _mock.paymentMethod1.id,
				firstPaymentDate: new Date("2024-05-15T00:00:00.000Z"),
				schedule: "Monthly" as const,
				payedBy: [], // Empty array - creator not included
			};

			// WHEN/THEN
			try {
				await caller.subscription.edit(updated);
				expect().fail();
			} catch (e) {
				expect((e as Error).message).toContain(
					"The creator must be included in the users who pay",
				);
			}
		});

		test("non-existent subscription fails", async () => {
			// GIVEN
			const nonExistentId = 99999;
			const updated = {
				id: nonExistentId,
				name: "Should Fail",
				description: "This should fail",
				category: _mock.category1.id,
				price: 10.0,
				currency: "USD" as const,
				paymentMethod: _mock.paymentMethod1.id,
				firstPaymentDate: new Date("2024-05-15T00:00:00.000Z"),
				schedule: "Monthly" as const,
				payedBy: [_mock.user1.id],
			};

			// WHEN/THEN
			try {
				await caller.subscription.edit(updated);
				expect().fail();
			} catch (e) {
				expect((e as Error).message).toContain("Error creating subscription");
			}
		});

		test("changes schedule from Monthly to Yearly", async () => {
			// GIVEN
			const updated = {
				id: _mock.subscription1.id,
				name: _mock.subscription1.name,
				description: _mock.subscription1.description,
				category: _mock.subscription1.category,
				price: _mock.subscription1.price,
				currency: _mock.subscription1.currency,
				paymentMethod: _mock.subscription1.paymentMethod,
				firstPaymentDate: _mock.subscription1.firstPaymentDate,
				schedule: "Yearly" as const, // Changed from Monthly to Yearly
				payedBy: [_mock.user1.id],
			};

			// WHEN
			const result = await caller.subscription.edit(updated);

			// THEN
			expect(result).toHaveProperty("id", updated.id);
			const subscriptionDb = await ctx.db.query.subscriptions.findFirst({
				where: (tb, { eq }) => eq(tb.id, updated.id),
			});
			expect(subscriptionDb).toBeDefined();
			expect(subscriptionDb?.schedule).toBe("Yearly");
		});

		test("price and currency", async () => {
			// GIVEN
			const updated = {
				id: _mock.subscription1.id,
				name: _mock.subscription1.name,
				description: _mock.subscription1.description,
				category: _mock.subscription1.category,
				price: 99.99,
				currency: "GBP" as const,
				paymentMethod: _mock.subscription1.paymentMethod,
				firstPaymentDate: _mock.subscription1.firstPaymentDate,
				schedule: _mock.subscription1.schedule,
				payedBy: [_mock.user1.id],
			};

			// WHEN
			const result = await caller.subscription.edit(updated);

			// THEN
			expect(result).toHaveProperty("id", updated.id);
			const subscriptionDb = await ctx.db.query.subscriptions.findFirst({
				where: (tb, { eq }) => eq(tb.id, updated.id),
			});
			expect(subscriptionDb).toBeDefined();
			expect(subscriptionDb?.price).toBe(99.99);
			expect(subscriptionDb?.currency).toBe("GBP");
		});
	});
});
