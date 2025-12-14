import { describe, expect, test } from "bun:test";
import { db } from "~/server/db";
import { subscriptions } from "~/server/db/schema";
import * as _mock from "~/tests/integrations/_mock";
import { createTestCaller } from "~/tests/integrations/_utils";

describe("Categories", async () => {
	const [caller] = await createTestCaller();

	test("Get all default", async () => {
		// WHEN
		const categories = await caller.category.getAll();

		// THEN
		expect(categories).toHaveLength(2);
		expect(categories[0]).toMatchObject(_mock.category1);
		expect(categories[1]).toMatchObject(_mock.category2);
	});

	test("Add", async () => {
		// GIVEN
		const newCategory = {
			name: "New Category",
			icon: "sparkle",
		};

		// WHEN
		const category = await caller.category.create(newCategory);

		// THEN
		expect(category).toMatchObject(newCategory);
		const categoryDb = await db.query.categories.findFirst({
			where: (tb, { eq }) => eq(tb.id, category.id),
		});
		expect(categoryDb).toBeDefined();
		expect(categoryDb?.name).toBe(newCategory.name);
		expect(categoryDb?.icon).toBe(newCategory.icon);
	});

	test("Add with invalid icon", async () => {
		// GIVEN
		const newCategory = {
			name: "New Category",
			icon: "doesnotexist",
		};

		// WHEN
		// await expect(async () => {
		// 	await caller.category.create(newCategory);
		// }).rejects.toThrow("Invalid icon");
		try {
			await caller.category.create(newCategory);
		} catch (e) {
			expect((e as Error).message).toContain("Invalid icon");
			return;
		}
		expect().fail();
	});

	test("Add with empty name", async () => {
		// GIVEN
		const newCategory = {
			name: "",
			icon: "sparkle",
		};

		// WHEN
		// await expect(async () => {
		// 	await caller.category.create(newCategory);
		// }).rejects.toThrow("Name cannot be empty");
		try {
			await caller.category.create(newCategory);
		} catch (e) {
			expect((e as Error).message).toContain("Name cannot be empty");
			return;
		}
		expect().fail();
	});

	test("Delete", async () => {
		// GIVEN
		const categoryToDelete = {
			name: "Category To Delete",
			icon: "trash",
		};
		const category = await caller.category.create(categoryToDelete);

		// WHEN
		const res = await caller.category.delete(category.id);

		// THEN
		expect(res.success).toBeTrue();
		const categoryDb = await db.query.categories.findFirst({
			where: (tb, { eq }) => eq(tb.id, category.id),
		});
		expect(categoryDb).toBeUndefined();
	});

	test("Delete with assigned subscription", async () => {
		// GIVEN
		const categoryToDelete = {
			name: "Category To Delete With Subscription",
			icon: "trash",
		};
		const category = await caller.category.create(categoryToDelete);
		const subscription = {
			..._mock.subscription1,
			category: category.id,
			id: 9998,
		};
		await db.insert(subscriptions).values(subscription);

		// WHEN
		const res = await caller.category.delete(category.id);

		// THEN
		expect(res.success).toBeTrue();
		const categoryDb = await db.query.categories.findFirst({
			where: (tb, { eq }) => eq(tb.id, category.id),
		});
		expect(categoryDb).toBeUndefined();
		const subscriptionDb = await db.query.subscriptions.findFirst({
			where: (tb, { eq }) => eq(tb.id, subscription.id),
		});
		expect(subscriptionDb).toBeDefined();
		expect(subscriptionDb?.category).toBe(1);
	});

	test("Edit", async () => {
		// GIVEN
		const categoryToEdit = {
			name: "Category To Edit",
			icon: "sparkle",
		};
		const category = await caller.category.create(categoryToEdit);

		// WHEN
		const updatedData = {
			id: category.id,
			name: "Edited Category",
			icon: "edit",
		};
		const updatedCategory = await caller.category.edit(updatedData);

		// THEN
		expect(updatedCategory).toMatchObject({
			name: updatedData.name,
			icon: updatedData.icon,
		});
		const categoryDb = await db.query.categories.findFirst({
			where: (tb, { eq }) => eq(tb.id, category.id),
		});
		expect(categoryDb).toBeDefined();
		expect(categoryDb?.name).toBe(updatedData.name);
		expect(categoryDb?.icon).toBe(updatedData.icon);
	});

	test("Edit with assigned subscription", async () => {
		// GIVEN
		const categoryToEdit = {
			name: "Category With Subscriptions",
			icon: "sparkle",
		};
		const category = await caller.category.create(categoryToEdit);
		const subscription = {
			..._mock.subscription1,
			category: category.id,
			id: 9999,
		};
		await db.insert(subscriptions).values(subscription);

		// WHEN
		const updatedData = {
			id: category.id,
			name: "Edited Category",
			icon: "edit",
		};
		const updatedCategory = await caller.category.edit(updatedData);

		// THEN
		expect(updatedCategory).toMatchObject({
			name: updatedData.name,
			icon: updatedData.icon,
		});
		const categoryDb = await db.query.categories.findFirst({
			where: (tb, { eq }) => eq(tb.id, category.id),
		});
		expect(categoryDb).toBeDefined();
		expect(categoryDb?.name).toBe(updatedData.name);
		expect(categoryDb?.icon).toBe(updatedData.icon);

		const subscriptionDb = await db.query.subscriptions.findFirst({
			where: (tb, { eq }) => eq(tb.id, subscription.id),
		});
		expect(subscriptionDb).toBeDefined();
		expect(subscriptionDb?.category).toBe(category.id);
	});
});
