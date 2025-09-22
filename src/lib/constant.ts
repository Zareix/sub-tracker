export const SCHEDULES = ["Monthly", "Yearly"] as const;
export type Schedule = (typeof SCHEDULES)[number];

export const SORTS = [
	{
		label: "Price: Low to High",
		key: "PRICE_ASC",
	},
	{
		label: "Price: High to Low",
		key: "PRICE_DESC",
	},
	{
		label: "Next Payment Date",
		key: "NEXT_PAYMENT_DATE",
	},
] as const;
export type Sort = (typeof SORTS)[number]["key"];

export const Currencies = ["USD", "EUR", "GBP"] as const;
export type Currency = (typeof Currencies)[number];
export const DEFAULT_BASE_CURRENCY = "EUR" as const;
export const CURRENCY_SYMBOLS = {
	USD: "$",
	EUR: "€",
	GBP: "£",
} as const;

export const UserRoles = ["user", "admin"] as const;
export type UserRole = (typeof UserRoles)[number];
export const USER_ROLES: Record<UserRole, UserRole> = {
	user: "user",
	admin: "admin",
};
