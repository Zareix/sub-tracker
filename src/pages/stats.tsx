import {
	addMonths,
	endOfMonth,
	isBefore,
	isSameMonth,
	isThisMonth,
} from "date-fns";
import { InfoIcon } from "lucide-react";
import Head from "next/head";
import { useMemo } from "react";
import { Label, Pie, PieChart } from "recharts";
import { FiltersButton } from "~/components/subscriptions/filters";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "~/components/ui/chart";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import { Skeleton } from "~/components/ui/skeleton";
import { BASE_CURRENCY, CURRENCY_SYMBOLS } from "~/lib/constant";
import { useFilters } from "~/lib/hooks/use-filters";
import { getFilteredSubscriptions, rounded } from "~/lib/utils";
import { api, type RouterOutputs } from "~/utils/api";

const sum = (acc: number, price: number, usersLength?: number) => {
	if (usersLength && usersLength > 0) {
		return acc + price / usersLength;
	}
	return acc + price;
};

export default function Stats() {
	const [filters] = useFilters();
	const subscriptionsQuery = api.subscription.getAll.useQuery();

	const subscriptions = getFilteredSubscriptions(
		subscriptionsQuery.data ?? [],
		{
			...filters,
			schedule: null,
		},
	);

	const {
		expectedNextMonth,
		totalPerMonth,
		totalPerYear,
		remainingThisMonth,
		totalThisMonth,
	} = useMemo(() => {
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

		const totalPerMonth = totalMonthlySub + totalYearlySub / 12;

		const totalPerYear = totalMonthlySub * 12 + totalYearlySub;

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
			totalPerMonth,
			totalPerYear,
			remainingThisMonth,
			expectedNextMonth,
			totalThisMonth,
		};
	}, [subscriptions, filters.users]);

	if (subscriptionsQuery.isError) {
		return <div>Error: {subscriptionsQuery.error?.message}</div>;
	}

	return (
		<>
			<Head>
				<title>Sub Tracker - Stats</title>
			</Head>
			<div>
				<header className="flex items-center justify-between">
					<h1 className="font-bold text-3xl">Stats</h1>
					<FiltersButton
						filtersDisplayed={["users", "paymentMethods", "categories"]}
					/>
				</header>
				<div className="mt-2 grid gap-2 md:auto-rows-auto md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					<MonthlyStatsCard
						title="Monthly sub"
						subscriptions={subscriptions.filter(
							(subscription) => subscription.schedule === "Monthly",
						)}
						isLoading={subscriptionsQuery.isLoading}
					/>
					<MonthlyStatsCard
						title="Yearly sub"
						subscriptions={subscriptions.filter(
							(subscription) => subscription.schedule === "Yearly",
						)}
						isLoading={subscriptionsQuery.isLoading}
					/>
					<StatsCard
						title="Smoothed over a month"
						description="Monthly + (yearly / 12)"
						value={totalPerMonth}
						isLoading={subscriptionsQuery.isLoading}
					/>
					<StatsCard
						title="Smoothed over a year"
						description="(Monthly * 12) + yearly"
						value={totalPerYear}
						isLoading={subscriptionsQuery.isLoading}
					/>
					<StatsCard
						title="This month"
						description="Subscriptions that were or will be paid this month"
						value={totalThisMonth}
						isLoading={subscriptionsQuery.isLoading}
					/>
					<StatsCard
						title="Remaining this month"
						description="Subscriptions that will be paid from today to the end of this month"
						value={remainingThisMonth}
						isLoading={subscriptionsQuery.isLoading}
					/>
					<StatsCard
						title="Expected next month"
						description="Subscriptions that will be paid next month"
						value={expectedNextMonth}
						isLoading={subscriptionsQuery.isLoading}
					/>
				</div>
			</div>
		</>
	);
}

const StatsCard = ({
	title,
	description,
	value,
	isLoading,
}: {
	title: string;
	description?: string;
	value: number;
	isLoading: boolean;
}) => {
	return (
		<Card className="py-5">
			<CardHeader className="flex flex-row items-center justify-between space-y-0">
				<CardTitle className="font-normal text-lg md:text-xl">
					{title}
				</CardTitle>
				{description && (
					<Popover>
						<PopoverTrigger className="mb-auto">
							<InfoIcon size={20} className="text-muted-foreground" />
						</PopoverTrigger>
						<PopoverContent
							className="w-max max-w-[300px] px-2 py-2 "
							side="top"
						>
							<p>{description}</p>
						</PopoverContent>
					</Popover>
				)}
			</CardHeader>
			<CardContent className="mt-2 flex items-center font-bold text-2xl">
				{isLoading ? <Skeleton className="mr-1 h-6 w-1/4" /> : rounded(value)}€
			</CardContent>
		</Card>
	);
};

const MonthlyStatsCard = ({
	title,
	subscriptions,
	isLoading,
}: {
	title: string;
	subscriptions: RouterOutputs["subscription"]["getAll"];
	isLoading: boolean;
}) => {
	const [filters] = useFilters();
	const totalMonthlySub = useMemo(
		() =>
			rounded(
				subscriptions.reduce(
					(acc, subscription) =>
						filters.users
							? acc + subscription.price / subscription.users.length
							: acc + subscription.price,
					0,
				),
			),
		[filters.users, subscriptions],
	);
	const chartData = useMemo(
		() =>
			subscriptions
				.map((subscription) => {
					return {
						price: subscription.price,
						category: subscription.category.name,
						usersLength: subscription.users.length,
					};
				})
				.reduce(
					(acc, subscription) => {
						const cat = acc.find(
							(cat) => cat.category === subscription.category,
						);
						const subPrice = filters.users
							? subscription.price / subscription.usersLength
							: subscription.price;
						if (cat) {
							cat.price += subPrice;
						} else {
							acc.push({
								category: subscription.category,
								price: subPrice,
								fill: `var(--chart-${acc.length + 1})`,
							});
						}
						return acc;
					},
					[] as Array<{
						category: string;
						price: number;
						fill: `var(--chart-${number})`;
					}>,
				)
				.map((x) => ({
					...x,
					price: rounded(x.price),
				})),
		[filters.users, subscriptions],
	);
	const chartConfig = useMemo(
		() =>
			Array.from(new Set(subscriptions.map((s) => s.category.name))).reduce(
				(acc, category) => {
					acc[category] = {
						label: category,
					};
					return acc;
				},
				{} as ChartConfig,
			),
		[subscriptions],
	);

	if (isLoading) {
		return (
			<Card className="flex flex-col md:row-span-2">
				<CardHeader className="items-center pb-0">
					<CardTitle className="font-normal text-lg md:text-xl">
						{title}
					</CardTitle>
				</CardHeader>
				<CardContent className="flex-1 pb-0">
					<div className="mx-auto flex aspect-square max-h-[250px] items-center justify-center">
						<Skeleton className="h-10 w-24" />
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="flex flex-col md:row-span-2">
			<CardHeader className="items-center pb-0">
				<CardTitle className="font-normal text-lg md:text-xl">
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent className="flex-1 pb-0">
				{chartData.length === 0 ? (
					<div className="mx-auto flex aspect-square max-h-[250px] items-center justify-center">
						<div className="text-muted-foreground">No data</div>
					</div>
				) : (
					<ChartContainer
						config={chartConfig}
						className="mx-auto aspect-square max-h-[250px]"
					>
						<PieChart>
							<ChartTooltip
								cursor={false}
								content={
									<ChartTooltipContent
										hideLabel
										valueFormatter={(value) =>
											value.toLocaleString() + CURRENCY_SYMBOLS[BASE_CURRENCY]
										}
									/>
								}
							/>
							<Pie
								data={chartData}
								dataKey="price"
								nameKey="category"
								innerRadius={60}
								strokeWidth={5}
							>
								<Label
									content={({ viewBox }) => {
										if (viewBox && "cx" in viewBox && "cy" in viewBox) {
											return (
												<text
													x={viewBox.cx}
													y={viewBox.cy}
													textAnchor="middle"
													dominantBaseline="middle"
												>
													<tspan
														x={viewBox.cx}
														y={viewBox.cy}
														className="fill-foreground font-bold text-3xl"
													>
														{totalMonthlySub.toLocaleString()}
													</tspan>
													<tspan
														x={viewBox.cx}
														y={(viewBox.cy ?? 0) + 24}
														className="fill-muted-foreground"
													>
														{BASE_CURRENCY}
													</tspan>
												</text>
											);
										}
									}}
								/>
							</Pie>
						</PieChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
};
