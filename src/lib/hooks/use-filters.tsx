import {
	parseAsArrayOf,
	parseAsInteger,
	parseAsString,
	parseAsStringLiteral,
	useQueryState,
} from "nuqs";
import { SCHEDULES, type Schedule } from "~/lib/constant";

export const useFilters = () => {
	const [schedule, setSchedule] = useQueryState(
		"schedule",
		parseAsStringLiteral<Schedule>(SCHEDULES),
	);
	const [paymentMethods, setPaymentMethods] = useQueryState(
		"paymentMethods",
		parseAsArrayOf(parseAsInteger).withDefault([]),
	);
	const [users, setUsers] = useQueryState("users", parseAsString);
	const [categories, setCategories] = useQueryState(
		"categories",
		parseAsArrayOf(parseAsInteger).withDefault([]),
	);

	const setFilters = (filters: {
		schedule: typeof schedule;
		paymentMethods: typeof paymentMethods;
		users: typeof users;
		categories: typeof categories;
	}) => {
		setSchedule(filters.schedule).catch(console.error);
		setPaymentMethods(filters.paymentMethods).catch(console.error);
		setUsers(filters.users).catch(console.error);
		setCategories(filters.categories).catch(console.error);
	};

	return [
		{
			schedule,
			paymentMethods,
			users,
			categories,
		},
		setFilters,
	] as const;
};

export type Filters = ReturnType<typeof useFilters>[0];
