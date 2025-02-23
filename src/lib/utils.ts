import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Filters, Sort } from "~/lib/constant";
import type { PaymentMethod, Subscription, User } from "~/server/db/schema";

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

export const getSortedSubscriptions = <
  T extends Array<Pick<Subscription, "name" | "price">>,
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

  return subscriptions;
};

export const getFilteredSubscriptions = <
  T extends Array<
    Pick<Subscription, "schedule"> & {
      users: Array<Pick<User, "id">>;
      paymentMethod: Pick<PaymentMethod, "id">;
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
  return filteredSubscriptions;
};

export const rounded = (val: number, precision = 2) => {
  return Math.round(val * Math.pow(10, precision)) / Math.pow(10, precision);
};
