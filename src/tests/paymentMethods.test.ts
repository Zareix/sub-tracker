import { describe, expect, test } from "bun:test";
import { db } from "~/server/db";
import { createTestCaller } from "~/tests/_utils";
import * as _mock from "./_mock";

describe("Payment Methods", async () => {
	const [caller] = await createTestCaller();

	test("Get all default", async () => {
		// WHEN
		const methods = await caller.paymentMethod.getAll();

		// THEN
		expect(methods).toHaveLength(2);
		expect(methods[0]).toMatchObject(_mock.paymentMethod1);
		expect(methods[1]).toMatchObject(_mock.paymentMethod2);
	});

	test("Create", async () => {
		// GIVEN
		const newMethod = {
			name: "Bank Transfer",
			image: "bank-transfer.png",
		};

		// WHEN
		const result = await caller.paymentMethod.create(newMethod);

		// THEN
		expect(result).toHaveProperty("id");
		const methodDb = await db.query.paymentMethods.findFirst({
			where: (tb, { eq }) => eq(tb.id, result.id),
		});
		expect(methodDb).toBeDefined();
		expect(methodDb?.name).toBe(newMethod.name);
		expect(methodDb?.image).toBe(newMethod.image);
	});

	test("Create no image", async () => {
		// GIVEN
		const newMethod = {
			name: "Bank Transfer",
		};

		// WHEN
		const result = await caller.paymentMethod.create(newMethod);

		// THEN
		expect(result).toHaveProperty("id");
		const methodDb = await db.query.paymentMethods.findFirst({
			where: (tb, { eq }) => eq(tb.id, result.id),
		});
		expect(methodDb).toBeDefined();
		expect(methodDb?.name).toBe(newMethod.name);
		expect(methodDb?.image).toBeNull();
	});

	test("Create empty name", async () => {
		// GIVEN
		const newMethod = {
			name: "",
		};

		// WHEN
		// await expect(async () => {
		//     await caller.paymentMethod.create(newMethod);
		//   }).rejects.toThrow();
		try {
			await caller.paymentMethod.create(newMethod);
		} catch (e) {
			expect((e as Error).message).toContain("Name cannot be empty");
			return;
		}
		expect().fail();
	});

	test("Delete", async () => {
		// GIVEN
		const paymentMethodToDelete = {
			name: "Temporary Method",
			image: "temp-method.png",
		};
		const created = await caller.paymentMethod.create(paymentMethodToDelete);

		// WHEN
		const result = await caller.paymentMethod.delete(created.id);

		// THEN
		expect(result.success).toBeTrue();
		const methodDb = await db.query.paymentMethods.findFirst({
			where: (tb, { eq }) => eq(tb.id, created.id),
		});
		expect(methodDb).toBeUndefined();
	});

	test("Edit", async () => {
		// GIVEN
		const original = await db.query.paymentMethods.findFirst({
			where: (tb, { eq }) => eq(tb.id, _mock.paymentMethod1.id),
		});
		expect(original).toBeDefined();

		const updated = {
			id: _mock.paymentMethod1.id,
			name: "Updated Credit Card",
			image: "updated-credit-card.png",
		};

		// WHEN
		const result = await caller.paymentMethod.edit(updated);

		// THEN
		expect(result).toHaveProperty("id", updated.id);
		const methodDb = await db.query.paymentMethods.findFirst({
			where: (tb, { eq }) => eq(tb.id, updated.id),
		});
		expect(methodDb).toBeDefined();
		expect(methodDb?.name).toBe(updated.name);
		expect(methodDb?.image).toBe(updated.image);
	});
});
