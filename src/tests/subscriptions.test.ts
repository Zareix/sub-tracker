import { describe, expect, test } from "bun:test";
import { endOfDay, setMilliseconds, subMonths } from "date-fns";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { db } from "~/server/db";
import { subscriptions, usersToSubscriptions } from "~/server/db/schema";
import * as _mock from "./_mock";

const compareDates = (date1: Date, date2: Date) => {
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

	test("Get subscriptions", async () => {
		// GIVEN
		const subscription = {
			id: 1,
			name: "Test Subscription",
			category: 1,
			price: 10,
			currency: "EUR" as const,
			paymentMethod: 1,
			schedule: "Monthly" as const,
			firstPaymentDate: subMonths(endOfDay(_mock.now), 2),
		};
		await db.insert(subscriptions).values(subscription);
		await db.insert(usersToSubscriptions).values({
			userId: _mock.user1.id,
			subscriptionId: subscription.id,
		});

		// WHEN
		const results = await caller.subscription.getAll();

		// THEN
		expect(results).toHaveLength(1);
		const result = results[0];
		if (!result) {
			return expect().fail("Result is undefined");
		}
		expect(result.name).toBe("Test Subscription");
		expect(result.price).toBe(10);
		expect(result.originalPrice).toBe(10);
		expect(result.schedule).toBe("Monthly");
		expect(result.description).toBe("");
		expect(result.currency).toBe("EUR");
		expect(result.users).toHaveLength(1);
		expect(result.users[0]).toMatchObject(_mock.user1);
		expect(result.category).toMatchObject(_mock.category1);
		expect(result.paymentMethod).toMatchObject(_mock.paymentMethod1);
		compareDates(result.firstPaymentDate, subscription.firstPaymentDate);
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
});
