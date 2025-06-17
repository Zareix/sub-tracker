import { relations, sql } from "drizzle-orm";
import {
	index,
	int,
	integer,
	primaryKey,
	real,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import type { Currency, Schedule, UserRole } from "~/lib/constant";

export const exchangeRates = sqliteTable(
	"exchange_rate",
	{
		baseCurrency: text("base_currency", { length: 255 }).notNull(),
		targetCurrency: text("target_currency", { length: 255 }).notNull(),
		rate: real("rate").notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.baseCurrency, table.targetCurrency] }),
		index("exchange_rate_idx").on(table.baseCurrency, table.targetCurrency),
	],
);

export type ExchangeRate = typeof exchangeRates.$inferSelect;

export const categories = sqliteTable(
	"category",
	{
		id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
		name: text("name", { length: 256 }).notNull(),
		icon: text("icon", { length: 256 }),
	},
	(table) => [index("category_name_idx").on(table.name)],
);

export const categoriesRelations = relations(categories, ({ many }) => ({
	subscriptions: many(subscriptions),
}));

export type Category = typeof categories.$inferSelect;

export const paymentMethods = sqliteTable(
	"payment_method",
	{
		id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
		name: text("name", { length: 256 }).notNull(),
		image: text("image", { length: 256 }),
	},
	(table) => [index("payement_method_name_idx").on(table.name)],
);

export const paymentMethodsRelations = relations(
	paymentMethods,
	({ many }) => ({
		subscriptions: many(subscriptions),
	}),
);

export type PaymentMethod = typeof paymentMethods.$inferSelect;

export const subscriptions = sqliteTable(
	"subscription",
	{
		id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
		name: text("name", { length: 256 }).notNull(),
		category: int("category", { mode: "number" }).notNull().default(1),
		image: text("image", { length: 256 }),
		description: text("description", { length: 256 }).notNull().default(""),
		price: real("price").notNull().default(0),
		currency: text("currency", { length: 255 })
			.notNull()
			.$type<Currency>()
			.default("EUR"),
		paymentMethod: int("payment_method", { mode: "number" })
			.notNull()
			.references(() => paymentMethods.id),
		schedule: text("schedule", { length: 255 }).$type<Schedule>().notNull(),
		url: text("url", { length: 256 }),
		firstPaymentDate: int("first_payment_date", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
		createdAt: int("created_at", { mode: "timestamp" })
			.default(sql`(unixepoch())`)
			.notNull(),
		updatedAt: int("updatedAt", { mode: "timestamp" }).$onUpdate(
			() => new Date(),
		),
	},
	(table) => [index("subscription_name_idx").on(table.name)],
);

export const subscriptionsRelations = relations(
	subscriptions,
	({ many, one }) => ({
		usersToSubscriptions: many(usersToSubscriptions),
		paymentMethod: one(paymentMethods, {
			fields: [subscriptions.paymentMethod],
			references: [paymentMethods.id],
		}),
		category: one(categories, {
			fields: [subscriptions.category],
			references: [categories.id],
		}),
	}),
);

export type Subscription = typeof subscriptions.$inferSelect;

export const usersToSubscriptions = sqliteTable("users_to_subscriptions", {
	userId: text("user_id")
		.notNull()
		.references(() => users.id),
	subscriptionId: int("subscription_id")
		.notNull()
		.references(() => subscriptions.id),
});

export const usersToSubscriptionsRelations = relations(
	usersToSubscriptions,
	({ one }) => ({
		subscription: one(subscriptions, {
			fields: [usersToSubscriptions.subscriptionId],
			references: [subscriptions.id],
		}),
		user: one(users, {
			fields: [usersToSubscriptions.userId],
			references: [users.id],
		}),
	}),
);

export const users = sqliteTable(
	"user",
	{
		id: text("id", { length: 255 })
			.notNull()
			.primaryKey()
			.$defaultFn(() => Bun.randomUUIDv7()),
		name: text("name", { length: 255 }).notNull(),
		email: text("email").notNull().unique(),
		role: text("role", { length: 255 })
			.notNull()
			.$type<UserRole>()
			.default("user"),
		image: text("image", { length: 255 }),
		emailVerified: integer("email_verified", { mode: "boolean" })
			.notNull()
			.default(false),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
	},
	(table) => [index("user_name_idx").on(table.name)],
);

export type User = typeof users.$inferSelect;

export const usersRelations = relations(users, ({ many }) => ({
	usersToSubscriptions: many(usersToSubscriptions),
}));

// --- BETTER AUTH ---

export const session = sqliteTable("session", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => Bun.randomUUIDv7()),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	token: text("token").notNull().unique(),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => Bun.randomUUIDv7()),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: integer("access_token_expires_at", {
		mode: "timestamp",
	}),
	refreshTokenExpiresAt: integer("refresh_token_expires_at", {
		mode: "timestamp",
	}),
	scope: text("scope"),
	password: text("password"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => Bun.randomUUIDv7()),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }),
	updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const passkey = sqliteTable("passkey", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => Bun.randomUUIDv7()),
	name: text("name"),
	publicKey: text("public_key").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	credentialID: text("credential_i_d").notNull(),
	counter: integer("counter").notNull(),
	deviceType: text("device_type").notNull(),
	backedUp: integer("backed_up", { mode: "boolean" }).notNull(),
	transports: text("transports"),
	createdAt: integer("created_at", { mode: "timestamp" }),
	aaguid: text("aaguid"),
});
