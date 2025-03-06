import { parseAsJson, useQueryState } from "nuqs";
import { filtersSchema } from "~/lib/constant";

export const useFilters = () =>
  useQueryState("filters", {
    ...parseAsJson(filtersSchema.parse),
    defaultValue: {
      schedule: null,
      paymentMethodId: null,
      users: null,
      categoryId: null,
    },
  });
