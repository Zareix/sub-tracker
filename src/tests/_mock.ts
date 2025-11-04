import { endOfDay, subMonths } from "date-fns";
import type {
	Category,
	PaymentMethod,
	Subscription,
	User,
} from "~/server/db/schema";

export const now = new Date("2020-05-14T14:00:00.000Z");

export const user1: User = {
	id: "clgb17vnp000008jjere5g15i",
	name: "Test User",
	email: "test@example.com",
	image: null,
	emailVerified: true,
	createdAt: new Date(),
	updatedAt: new Date(),
	baseCurrency: "EUR" as const,
	role: "admin" as const,
	banned: false,
	banReason: null,
	banExpires: null,
};

export const category1: Category = {
	id: 1,
	name: "Entertainment",
	icon: "activity",
};

export const paymentMethod1: PaymentMethod = {
	id: 1,
	name: "Credit Card",
	image: "credit-card.png",
};

export const paymentMethod2: PaymentMethod = {
	id: 2,
	name: "PayPal",
	image: "paypal.png",
};

export const subscription1: Subscription = {
	id: 1,
	name: "Netflix",
	category: category1.id,
	price: 12.99,
	currency: "EUR" as const,
	paymentMethod: paymentMethod1.id,
	schedule: "Monthly" as const,
	image: null,
	url: "https://www.netflix.com",
	firstPaymentDate: subMonths(endOfDay(now), 2),
	description: "Streaming service",
	createdAt: new Date(),
	updatedAt: new Date(),
};

export const session = {
	session: {
		id: "test-session-id",
		createdAt: new Date(),
		updatedAt: new Date(),
		userId: user1.id,
		expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
		token: "test-token",
	},
	user: user1,
};
