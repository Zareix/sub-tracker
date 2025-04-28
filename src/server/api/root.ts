import { adminRouter } from "~/server/api/routers/admin";
import { categoryRouter } from "~/server/api/routers/categories";
import { paymentMethodRouter } from "~/server/api/routers/paymentMethod";
import { subscriptionRouter } from "~/server/api/routers/subscription";
import { userRouter } from "~/server/api/routers/user";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
	subscription: subscriptionRouter,
	user: userRouter,
	paymentMethod: paymentMethodRouter,
	admin: adminRouter,
	category: categoryRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
