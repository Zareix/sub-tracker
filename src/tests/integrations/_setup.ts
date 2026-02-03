import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	setSystemTime,
} from "bun:test";
import { rmdir } from "node:fs/promises";
import {
	categories,
	paymentMethods,
	subscriptions,
	users,
	usersToSubscriptions,
} from "~/server/db/schema";
import * as _mock from "~/tests/integrations/_mock";
import { cleanupDatabase } from "~/tests/integrations/_utils";

const DATABASE_PATH = "./db-test.sqlite";
const UPLOADS_FOLDER = "./uploads-test";

// @ts-expect-error It's possible
process.env.NODE_ENV = "test";
process.env.DATABASE_PATH = DATABASE_PATH;
process.env.BETTER_AUTH_URL = "http://localhost:3000";
process.env.ADMIN_EMAIL = _mock.user1.email;
process.env.UPLOADS_FOLDER = UPLOADS_FOLDER;
process.env.FIXER_API_KEY = "API_KEY_FOR_TESTS";

const { db } = await import("~/server/db");

beforeAll(async () => {
	setSystemTime(_mock.now);

	await import("~/server/db/migrate");
});

beforeEach(async () => {
	await Promise.all([
		db.insert(users).values(_mock.user1),
		db.insert(categories).values([_mock.category1, _mock.category2]),
		db
			.insert(paymentMethods)
			.values([_mock.paymentMethod1, _mock.paymentMethod2]),
		db.insert(subscriptions).values(_mock.subscription1),
	]);
	await db.insert(usersToSubscriptions).values({
		subscriptionId: _mock.subscription1.id,
		userId: _mock.user1.id,
	});
});

afterEach(async () => {
	await cleanupDatabase(db);
});

afterAll(async () => {
	await Promise.all([
		Bun.file(DATABASE_PATH)
			.delete()
			.catch(() => {}),
		Bun.file(`${DATABASE_PATH}-shm`)
			.delete()
			.catch(() => {}),
		Bun.file(`${DATABASE_PATH}-wal`)
			.delete()
			.catch(() => {}),
		rmdir(UPLOADS_FOLDER).catch(() => {}),
	]);
});
