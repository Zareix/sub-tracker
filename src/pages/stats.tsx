import { api } from "~/utils/api";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { FiltersButton } from "~/components/subscriptions/filters";
import { getFilteredSubscriptions, rounded } from "~/lib/utils";
import { parseAsJson, useQueryState } from "nuqs";
import { filtersSchema } from "~/lib/constant";
import { Skeleton } from "~/components/ui/skeleton";
import Head from "next/head";

export default function Stats() {
  const [filters] = useQueryState("filters", {
    ...parseAsJson(filtersSchema.parse),
    defaultValue: {
      schedule: null,
      paymentMethodId: null,
      users: null,
      categoryId: null,
    },
  });
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
        <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
          <StatsCard
            title="Total monthly sub"
            value={totalMonthlySub}
            isLoading={subscriptionsQuery.isLoading}
          />
          <StatsCard
            title="Total yearly sub"
            value={totalYearlySub}
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
