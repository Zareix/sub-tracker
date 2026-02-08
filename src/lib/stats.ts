import {
	addMonths,
	endOfMonth,
	isBefore,
	isSameMonth,
	isThisMonth,
} from "date-fns";
import type { Filters } from "~/lib/hooks/use-filters";
import { rounded, sum } from "~/lib/utils";
import type { RouterOutputs } from "~/trpc/react";

export const getStats = (
	subscriptions: RouterOutputs["subscription"]["getAll"],
	filters: Pick<Filters, "users">,
) => {
	const totalMonthlySub = subscriptions
		.filter((subscription) => subscription.schedule === "Monthly")
		.reduce(
			(acc, subscription) =>
				sum(
					acc,
					subscription.price,
					filters.users ? subscription.users.length : undefined,
				),
			0,
		);

	const totalQuarterlySub = subscriptions
		.filter((subscription) => subscription.schedule === "Quarterly")
		.reduce(
			(acc, subscription) =>
				sum(
					acc,
					subscription.price,
					filters.users ? subscription.users.length : undefined,
				),
			0,
		);

	const totalSemiannualSub = subscriptions
		.filter((subscription) => subscription.schedule === "Semiannual")
		.reduce(
			(acc, subscription) =>
				sum(
					acc,
					subscription.price,
					filters.users ? subscription.users.length : undefined,
				),
			0,
		);

	const totalYearlySub = subscriptions
		.filter((subscription) => subscription.schedule === "Yearly")
		.reduce(
			(acc, subscription) =>
				sum(
					acc,
					subscription.price,
					filters.users ? subscription.users.length : undefined,
				),
			0,
		);

	const totalPerMonth =
		totalMonthlySub +
		totalQuarterlySub / 3 +
		totalSemiannualSub / 6 +
		totalYearlySub / 12;

	const totalPerYear =
		totalMonthlySub * 12 +
		totalQuarterlySub * 4 +
		totalSemiannualSub * 2 +
		totalYearlySub;

	const endOfMonthDate = endOfMonth(new Date());
	const remainingThisMonth = subscriptions
		.filter((subscription) =>
			isBefore(subscription.nextPaymentDate, endOfMonthDate),
		)
		.reduce(
			(acc, subscription) =>
				sum(
					acc,
					subscription.price,
					filters.users ? subscription.users.length : undefined,
				),
			0,
		);

	const nextMonthDate = addMonths(new Date(), 1);
	const expectedNextMonth = subscriptions
		.filter(
			(subscription) =>
				isSameMonth(subscription.nextPaymentDate, nextMonthDate) ||
				isSameMonth(subscription.secondNextPaymentDate, nextMonthDate),
		)
		.reduce(
			(acc, subscription) =>
				sum(
					acc,
					subscription.price,
					filters.users ? subscription.users.length : undefined,
				),
			0,
		);

	const totalThisMonth = subscriptions
		.filter(
			(subscription) =>
				isThisMonth(subscription.nextPaymentDate) ||
				isThisMonth(subscription.previousPaymentDate),
		)
		.reduce(
			(acc, subscription) =>
				sum(
					acc,
					subscription.price,
					filters.users ? subscription.users.length : undefined,
				),
			0,
		);

	return {
		totalPerMonth: rounded(totalPerMonth),
		totalPerYear: rounded(totalPerYear),
		remainingThisMonth: rounded(remainingThisMonth),
		expectedNextMonth: rounded(expectedNextMonth),
		totalThisMonth: rounded(totalThisMonth),
	};
};
