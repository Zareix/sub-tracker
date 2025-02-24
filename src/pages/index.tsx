import { api } from "~/utils/api";
import { FiltersButton } from "~/components/subscriptions/filters";
import { SortButton } from "~/components/subscriptions/sort";
import { CreateSubscriptionDialog } from "~/components/subscriptions/create";
import { Calendar1Icon, EllipsisVerticalIcon } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { SubscriptionList } from "~/components/subscriptions/list";

export default function Home() {
  const subscriptionsQuery = api.subscription.getAll.useQuery();

  if (subscriptionsQuery.isError) {
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
        {subscriptionsQuery.isLoading ? (
          <Card className="mt-3">
            <CardContent>
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-14" />
                <h2 className="flex-grow text-xl font-semibold">
                  <Skeleton className="h-6 w-20 md:w-28" />
                </h2>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar1Icon size={16} />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex items-center text-lg">
                  <Skeleton className="h-6 w-12" />€
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-4 md:w-10"
                  disabled
                >
                  <EllipsisVerticalIcon size={24} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <SubscriptionList subscriptions={subscriptionsQuery.data ?? []} />
        )}
      </div>
      <div className="fixed bottom-6 left-auto right-2 flex items-center justify-center gap-4 p-4">
        <CreateSubscriptionDialog />
      </div>
    </div>
  );
}
