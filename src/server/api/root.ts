import { paymentMethodRouter } from "~/server/api/routers/paymentMethod";
import { subscriptionRouter } from "~/server/api/routers/subscription";
import { userRouter } from "~/server/api/routers/user";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  subscription: subscriptionRouter,
  user: userRouter,
  paymentMethod: paymentMethodRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
