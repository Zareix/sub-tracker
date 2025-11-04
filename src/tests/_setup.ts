import { afterAll, beforeAll, setSystemTime } from "bun:test";
import {
	categories,
	paymentMethods,
	subscriptions,
	users,
	usersToSubscriptions,
} from "~/server/db/schema";
import * as _mock from "./_mock";

const DATABASE_PATH = "./db-test.sqlite";

// @ts-expect-error Possible in Bun
process.env.NODE_ENV = "test";
process.env.DATABASE_PATH = DATABASE_PATH;
process.env.BETTER_AUTH_URL = "http://localhost:3000";
process.env.ADMIN_EMAIL = _mock.user1.email;
process.env.UPLOADS_FOLDER = "./uploads-test";
process.env.VAPID_PUBLIC_KEY = "BMockVapidPublicKeyForTests";
process.env.VAPID_PRIVATE_KEY = "MockVapidPrivateKeyForTests";
process.env.FIXER_API_KEY = "API_KEY_FOR_TESTS";

beforeAll(async () => {
	setSystemTime(_mock.now);

	await import("~/server/db/migrate");
	const { db } = await import("~/server/db");

	await db.insert(users).values(_mock.user1);
	await db.insert(categories).values(_mock.category1);
	await db
		.insert(paymentMethods)
		.values([_mock.paymentMethod1, _mock.paymentMethod2]);
	await db.insert(subscriptions).values(_mock.subscription1);
	await db.insert(usersToSubscriptions).values({
		subscriptionId: _mock.subscription1.id,
		userId: _mock.user1.id,
	});
});

afterAll(async () => {
	await Bun.file(DATABASE_PATH).delete();
	await Bun.file(`${DATABASE_PATH}-shm`).delete();
	await Bun.file(`${DATABASE_PATH}-wal`).delete();
});
