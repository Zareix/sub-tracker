import {
	categories,
	paymentMethods,
	subscriptions,
	users,
	usersToSubscriptions,
} from "~/server/db/schema";
import * as _mock from "~/tests/integrations/_mock";

export const cleanupDatabase = async (db: typeof import("~/server/db").db) =>
	Promise.all([
		await db.delete(usersToSubscriptions),
		await db.delete(subscriptions),
		await db.delete(paymentMethods),
		await db.delete(categories),
		await db.delete(users),
	]);

export const createTestCaller = async () => {
	const { createCaller } = await import("~/server/api/root");
	const { createInnerTRPCContext } = await import("~/server/api/trpc");
	const ctx = createInnerTRPCContext({ session: _mock.session });
	const caller = createCaller(() => ctx);
	return [caller, ctx] as const;
};
