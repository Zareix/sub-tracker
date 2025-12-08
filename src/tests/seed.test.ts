import { describe, expect, test } from "bun:test";
import { env } from "~/env";
import { db } from "~/server/db";
import { seed } from "~/server/db/seed";
import { cleanupDatabase } from "~/tests/_utils";

describe("Seed", () => {
	test("Should create admin user", async () => {
		await cleanupDatabase(db);

		await seed();

		const adminUser = await db.query.users.findFirst({
			where: (user, { eq }) => eq(user.email, env.ADMIN_EMAIL),
		});

		expect(adminUser).toBeDefined();
		expect(adminUser?.role).toBe("admin");
	});

	test("Should create default category", async () => {
		await cleanupDatabase(db);

		await seed();

		const defaultCategory = await db.query.categories.findFirst({
			where: (category, { eq }) => eq(category.name, "Misc"),
		});

		expect(defaultCategory).toBeDefined();
		expect(defaultCategory?.id).toBe(1);
		expect(defaultCategory?.icon).toBe("circle-ellipsis");
	});

	test("Should create default payment method", async () => {
		await cleanupDatabase(db);

		await seed();

		const defaultPaymentMethod = await db.query.paymentMethods.findFirst({
			where: (paymentMethod, { eq }) => eq(paymentMethod.name, "Credit Card"),
		});

		expect(defaultPaymentMethod).toBeDefined();
		expect(defaultPaymentMethod?.id).toBe(1);
		expect(defaultPaymentMethod?.image).toBeNull();
	});
});
