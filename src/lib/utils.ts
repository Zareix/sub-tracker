import { clsx, type ClassValue } from "clsx";
import { compareAsc, format } from "date-fns";
import { twMerge } from "tailwind-merge";
import type { Filters, Sort } from "~/lib/constant";
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

  if (typeof val === "string" && !isNaN(Number(val))) {
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
  if (sort === "PRICE_DESC") {
    return subscriptions.sort((a, b) => b.price - a.price);
  }
  if (sort === "PRICE_ASC") {
    return subscriptions.sort((a, b) => a.price - b.price);
  }
  if (sort === "NEXT_PAYMENT_DATE") {
    return subscriptions.sort((a, b) =>
      compareAsc(a.nextPaymentDate, b.nextPaymentDate),
    );
  }
  return subscriptions.sort((a, b) => a.name.localeCompare(b.name));
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
  if (filters.paymentMethodId) {
    // @ts-expect-error Actually it's working, I just want the function to return the right type
    filteredSubscriptions = filteredSubscriptions.filter(
      (s) => s.paymentMethod.id === filters.paymentMethodId,
    );
  }
  if (filters.users) {
    // @ts-expect-error Actually it's working, I just want the function to return the right type
    filteredSubscriptions = filteredSubscriptions.filter((s) =>
      s.users.some((u) => u.id === filters.users),
    );
  }
  if (filters.categoryId) {
    // @ts-expect-error Actually it's working, I just want the function to return the right type
    filteredSubscriptions = filteredSubscriptions.filter(
      (s) => s.category.id === filters.categoryId,
    );
  }

  return filteredSubscriptions;
};

export const rounded = (val: number, precision = 2) => {
  return Math.round(val * Math.pow(10, precision)) / Math.pow(10, precision);
};

export const currencyToSymbol = (currency: string) => {
  switch (currency) {
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    case "USD":
      return "$";
    default:
      return "€";
  }
};

export const formatNextPaymentDate = (date: Date) => {
  // if (differenceInDays(date, new Date()) <= 6) {
  //   return formatRelative(date, new Date(), {

  //   });
  // }
  if (new Date().getFullYear() === date.getFullYear()) {
    return format(date, "dd/MM");
  }
  return format(date, "dd/MM/yyyy");
};
