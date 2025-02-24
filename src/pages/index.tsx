import { api } from "~/utils/api";
import { FiltersButton } from "~/components/subscriptions/filters";
import { SubscriptionList } from "~/components/subscriptions/list";
import { SortButton } from "~/components/subscriptions/sort";
import { CreateSubscriptionDialog } from "~/components/subscriptions/create";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "~/components/ui/calendar";

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
        <div className="flex items-center gap-2">
          <FiltersButton />
          <SortButton />
        </div>
      </header>
      <div className="grid">
        <SubscriptionList subscriptions={subscriptionsQuery.data} />
      </div>
      <div className="fixed bottom-6 left-auto right-2 flex items-center justify-center gap-4 p-4">
        <CreateSubscriptionDialog />
      </div>
    </div>
  );
}
