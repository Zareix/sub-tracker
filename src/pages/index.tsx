import { api } from "~/utils/api";
import { FiltersButton } from "~/components/subscriptions/filters";
import { SubscriptionList } from "~/components/subscriptions/list";
import { SortButton } from "~/components/subscriptions/sort";

export default function Home() {
  const subscriptionsQuery = api.subscription.getAll.useQuery();

  if (subscriptionsQuery.isLoading) {
    return <div>Loading...</div>;
  }

  if (subscriptionsQuery.isError || !subscriptionsQuery.data) {
    return <div>Error: {subscriptionsQuery.error?.message}</div>;
  }

  return (
    <div>
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <FiltersButton />
        <SortButton />
      </header>
      <div className="grid">
        <SubscriptionList subscriptions={subscriptionsQuery.data} />
      </div>
    </div>
  );
}
