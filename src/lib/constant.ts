import { z } from "zod";

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
] as const;
export type Sort = (typeof SORTS)[number]["key"];

export const filtersSchema = z
  .object({
    schedule: z.string().nullish(),
    paymentMethodId: z.number().nullish(),
    users: z.string().nullish(),
  })
  .default({
    schedule: null,
    paymentMethodId: null,
    users: null,
  });
export type Filters = z.infer<typeof filtersSchema>;

export const CURRENCIES = ["USD", "EUR", "GBP"] as const;
export type Currency = (typeof CURRENCIES)[number];
export const BASE_CURRENCY = "EUR";
