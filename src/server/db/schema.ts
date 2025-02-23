import { relations, sql } from "drizzle-orm";
import {
  index,
  int,
  primaryKey,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import type { AdapterAccount } from "next-auth/adapters";

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
    image: text("image", { length: 256 }),
    description: text("description", { length: 256 }).notNull().default(""),
    price: real("price").notNull().default(0),
    currency: text("currency", { length: 255 }).notNull().default("EUR"),
    paymentMethod: int("payment_method", { mode: "number" })
      .notNull()
      .references(() => paymentMethods.id),
    schedule: text("schedule", { length: 255 }).notNull(),
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
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name", { length: 255 }).notNull(),
    email: text("email", { length: 255 }).notNull(),
    emailVerified: int("email_verified", {
      mode: "timestamp",
    }).default(sql`(unixepoch())`),
    image: text("image", { length: 255 }),
  },
  (table) => [index("user_name_idx").on(table.name)],
);

export type User = typeof users.$inferSelect;

// --- NextAuth.js ---

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  usersToSubscriptions: many(usersToSubscriptions),
}));

export const accounts = sqliteTable(
  "account",
  {
    userId: text("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: text("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: text("provider", { length: 255 }).notNull(),
    providerAccountId: text("provider_account_id", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: int("expires_at"),
    token_type: text("token_type", { length: 255 }),
    scope: text("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: text("session_state", { length: 255 }),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    index("account_user_id_idx").on(account.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = sqliteTable(
  "session",
  {
    sessionToken: text("session_token", { length: 255 }).notNull().primaryKey(),
    userId: text("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: int("expires", { mode: "timestamp" }).notNull(),
  },
  (session) => [index("session_userId_idx").on(session.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = sqliteTable(
  "verification_token",
  {
    identifier: text("identifier", { length: 255 }).notNull(),
    token: text("token", { length: 255 }).notNull(),
    expires: int("expires", { mode: "timestamp" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);
