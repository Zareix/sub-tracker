"use client";

import { Calendar1Icon, InfoIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { CreateSubscriptionDialog } from "~/components/subscriptions/create";
import { FiltersButton } from "~/components/subscriptions/filters";
import { SubscriptionList } from "~/components/subscriptions/list";
import { SearchBar } from "~/components/subscriptions/search-bar";
import { SortButton } from "~/components/subscriptions/sort";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/react";

export default function HomePage() {
	const t = useTranslations("HomePage");
	const subscriptionsQuery = api.subscription.getAll.useQuery();

	return (
		<div>
			<header className="flex flex-wrap items-center justify-between gap-y-1">
				<h1 className="font-bold text-3xl">{t("title")}</h1>
				<div className="flex items-center gap-2">
					<CreateSubscriptionDialog
						trigger={
							<Button className="hidden md:block">
								{t("addNewSubscription")}
							</Button>
						}
					/>
					<SearchBar />
					<FiltersButton />
					<SortButton />
				</div>
			</header>
			<div className="mt-2 grid">
				{subscriptionsQuery.isLoading ? (
					<Card className="mt-3 border-none from-card opacity-50 shadow-none ring-transparent">
						<CardContent>
							<div className="flex items-center gap-2">
								<Skeleton className="h-10 w-14" />
								<div className="flex grow flex-col gap-1">
									<h2 className="font-semibold text-xl">
										<Skeleton className="h-6 w-20 md:w-28" />
									</h2>
									<div className="flex items-center gap-1 text-muted-foreground text-sm">
										<Calendar1Icon size={16} />
										<Skeleton className="h-4 w-16" />
									</div>
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
									<InfoIcon size={20} />
								</Button>
							</div>
						</CardContent>
					</Card>
				) : (
					<SubscriptionList subscriptions={subscriptionsQuery.data ?? []} />
				)}
			</div>
		</div>
	);
}
