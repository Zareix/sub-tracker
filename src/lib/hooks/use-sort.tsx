import { parseAsStringEnum, useQueryState } from "nuqs";
import { SORTS } from "~/lib/constant";

export const useSort = () => {
	return useQueryState(
		"sort",
		parseAsStringEnum(SORTS.map((s) => s.key)).withDefault("NEXT_PAYMENT_DATE"),
	);
};
