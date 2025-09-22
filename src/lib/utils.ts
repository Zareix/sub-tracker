import { type ClassValue, clsx } from "clsx";
import { compareAsc, format, isToday } from "date-fns";
import { twMerge } from "tailwind-merge";
import { CURRENCY_SYMBOLS, type Sort } from "~/lib/constant";
import type { Filters } from "~/lib/hooks/use-filters";
import type {
	Category,
	PaymentMethod,
	Subscription,
	User,
} from "~/server/db/schema";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function preprocessStringToNumber(val: unknown) {
	if (!val) {
		return undefined;
	}

	if (typeof val === "string" && !Number.isNaN(Number(val))) {
		return Number(val);
	}

	return val;
}

export function preprocessStringToDate(val: unknown) {
	if (!val) {
		return undefined;
	}

	if (typeof val === "string") {
		return new Date(val);
	}

	return val;
}

export const getSortedSubscriptions = <
	T extends Array<
		Pick<Subscription, "name" | "price"> & {
			nextPaymentDate: Date;
		}
	>,
>(
	subscriptions: T,
	sort: Sort | null,
): NoInfer<T> => {
	const sortedSubscriptions = subscriptions.sort((a, b) =>
		a.name.localeCompare(b.name),
	);
	if (sort === "PRICE_DESC") {
		return sortedSubscriptions.sort((a, b) => b.price - a.price);
	}
	if (sort === "PRICE_ASC") {
		return sortedSubscriptions.sort((a, b) => a.price - b.price);
	}
	if (sort === "NEXT_PAYMENT_DATE") {
		return sortedSubscriptions.sort((a, b) =>
			compareAsc(a.nextPaymentDate, b.nextPaymentDate),
		);
	}
	return sortedSubscriptions;
};

export const getFilteredSubscriptions = <
	T extends Array<
		Pick<Subscription, "schedule"> & {
			users: Array<Pick<User, "id">>;
			paymentMethod: Pick<PaymentMethod, "id">;
			category: Pick<Category, "id">;
		}
	>,
>(
	subscriptions: T,
	filters: Filters,
): NoInfer<T> => {
	let filteredSubscriptions = subscriptions;
	if (filters.schedule) {
		// @ts-expect-error Actually it's working, I just want the function to return the right type
		filteredSubscriptions = filteredSubscriptions.filter(
			(s) => s.schedule === filters.schedule,
		);
	}
	if (filters.paymentMethods.length > 0) {
		// @ts-expect-error Actually it's working, I just want the function to return the right type
		filteredSubscriptions = filteredSubscriptions.filter((s) =>
			filters.paymentMethods.includes(s.paymentMethod.id),
		);
	}
	if (filters.users) {
		// @ts-expect-error Actually it's working, I just want the function to return the right type
		filteredSubscriptions = filteredSubscriptions.filter((s) =>
			s.users.some((u) => u.id === filters.users),
		);
	}
	if (filters.categories.length > 0) {
		// @ts-expect-error Actually it's working, I just want the function to return the right type
		filteredSubscriptions = filteredSubscriptions.filter((s) =>
			filters.categories.includes(s.category.id),
		);
	}

	return filteredSubscriptions;
};

export const rounded = (val: number, precision = 2) => {
	return Math.round(val * 10 ** precision) / 10 ** precision;
};

export const currencyToSymbol = (currency: string) => {
	// @ts-ignore
	return CURRENCY_SYMBOLS[currency] ?? "¤";
};

export const formatNextPaymentDate = (date: Date) => {
	// if (differenceInDays(date, new Date()) <= 6) {
	//   return formatRelative(date, new Date(), {

	//   });
	// }
	if (isToday(date)) {
		return "Today";
	}
	if (new Date().getFullYear() === date.getFullYear()) {
		return format(date, "dd/MM");
	}
	return format(date, "dd/MM/yyyy");
};
