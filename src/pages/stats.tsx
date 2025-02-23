import { api } from "~/utils/api";
import { parseAsJson, useQueryState } from "nuqs";
import { filtersSchema } from "~/server/api/routers/schema";
import { Filters } from "~/components/subscriptions/filters";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function Stats() {
  const [filters, setFilters] = useQueryState("filters", {
    ...parseAsJson(filtersSchema.parse),
    defaultValue: {
      schedule: null,
      paymentMethodId: null,
      users: null,
    },
  });
  const subscriptionsQuery = api.subscription.getAll.useQuery();

  if (subscriptionsQuery.isLoading) {
    return <div>Loading...</div>;
  }

  if (subscriptionsQuery.isError || !subscriptionsQuery.data) {
    return <div>Error: {subscriptionsQuery.error?.message}</div>;
  }

  const totalMonthlySub = subscriptionsQuery.data
    .filter((subscription) => subscription.schedule === "Monthly")
    .reduce((acc, subscription) => {
      return acc + subscription.price;
    }, 0);

  const totalYearlySub = subscriptionsQuery.data
    .filter((subscription) => subscription.schedule === "Yearly")
    .reduce((acc, subscription) => {
      return acc + subscription.price;
    }, 0);

  const totalPerMonth =
    totalMonthlySub + Math.round((totalYearlySub / 12) * 100) / 100;

  const totalPerYear = totalMonthlySub * 12 + totalYearlySub;

  return (
    <div>
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Stats</h1>
        <Filters currentFilters={filters} setFilters={setFilters} />
      </header>
      <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
        <StatsCard title="Total monthly sub" value={totalMonthlySub} />
        <StatsCard title="Total yearly sub" value={totalYearlySub} />
        <StatsCard title="Total per month" value={totalPerMonth} />
        <StatsCard title="Total per year" value={totalPerYear} />
      </div>
    </div>
  );
}

const StatsCard = ({ title, value }: { title: string; value: number }) => {
  return (
    <Card className="py-5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-normal md:text-xl">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="mt-2 text-2xl font-bold">{value}€</CardContent>
    </Card>
  );
};
