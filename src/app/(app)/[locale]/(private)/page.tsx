"use client";

import { useTranslations } from "next-intl";
import { CreateSubscriptionDialog } from "~/components/subscriptions/create";
import { FiltersButton } from "~/components/subscriptions/filters";
import { SubscriptionList } from "~/components/subscriptions/list";
import { SearchBar } from "~/components/subscriptions/search-bar";
import { SortButton } from "~/components/subscriptions/sort";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { LoadingSkeleton } from "./loading";

export default function HomePage() {
	const t = useTranslations("HomePage");
	const subscriptionsQuery = api.subscription.getAll.useQuery();

	return (
		<>
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
					<LoadingSkeleton />
				) : (
					<SubscriptionList subscriptions={subscriptionsQuery.data ?? []} />
				)}
			</div>
		</>
	);
}
