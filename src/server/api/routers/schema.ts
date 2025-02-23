import { z } from "zod";

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
