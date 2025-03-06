import { api, type RouterOutputs } from "~/utils/api";
import { FiltersButton } from "~/components/subscriptions/filters";
import { getFilteredSubscriptions, rounded } from "~/lib/utils";
import { Skeleton } from "~/components/ui/skeleton";
import Head from "next/head";
import { useMemo } from "react";
import { useFilters } from "~/lib/hooks/use-filters";
import { Label, Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { BASE_CURRENCY, CURRENCY_SYMBOLS } from "~/lib/constant";

export default function Stats() {
  const [filters] = useFilters();
  const subscriptionsQuery = api.subscription.getAll.useQuery();

  if (subscriptionsQuery.isError) {
    return <div>Error: {subscriptionsQuery.error?.message}</div>;
  }

  const subscriptions = getFilteredSubscriptions(
    subscriptionsQuery.data ?? [],
    filters,
  );

  const totalMonthlySub = subscriptions
    .filter((subscription) => subscription.schedule === "Monthly")
    .reduce((acc, subscription) => {
      if (filters.users) {
        return acc + subscription.price / subscription.users.length;
      }
      return acc + subscription.price;
    }, 0);

  const totalYearlySub = subscriptions
    .filter((subscription) => subscription.schedule === "Yearly")
    .reduce((acc, subscription) => {
      if (filters.users) {
        return acc + subscription.price / subscription.users.length;
      }
      return acc + subscription.price;
    }, 0);

  const totalPerMonth = totalMonthlySub + totalYearlySub / 12;

  const totalPerYear = totalMonthlySub * 12 + totalYearlySub;

  return (
    <>
      <Head>
        <title>Sub Tracker - Stats</title>
      </Head>
      <div>
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Stats</h1>
          <FiltersButton
            filtersDisplayed={["users", "paymentMethodId", "categoryId"]}
          />
        </header>
        <div className="mt-2 grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <MonthlyStatsCard
            title="Total monthly sub"
            subscriptions={subscriptions.filter(
              (subscription) => subscription.schedule === "Monthly",
            )}
            isLoading={subscriptionsQuery.isLoading}
          />
          <MonthlyStatsCard
            title="Total yearly sub"
            subscriptions={subscriptions.filter(
              (subscription) => subscription.schedule === "Yearly",
            )}
            isLoading={subscriptionsQuery.isLoading}
          />
          <StatsCard
            title="Total per month"
            value={totalPerMonth}
            isLoading={subscriptionsQuery.isLoading}
          />
          <StatsCard
            title="Total per year"
            value={totalPerYear}
            isLoading={subscriptionsQuery.isLoading}
          />
        </div>
      </div>
    </>
  );
}

const StatsCard = ({
  title,
  value,
  isLoading,
}: {
  title: string;
  value: number;
  isLoading: boolean;
}) => {
  return (
    <Card className="py-5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-normal md:text-xl">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="mt-2 flex items-center text-2xl font-bold">
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
      subscriptions.reduce(
        (acc, subscription) =>
          filters.users
            ? acc + subscription.price / subscription.users.length
            : acc + subscription.price,
        0,
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
        ),
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
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle className="text-lg font-normal md:text-xl">
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
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-lg font-normal md:text-xl">
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
                            className="fill-foreground text-3xl font-bold"
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
