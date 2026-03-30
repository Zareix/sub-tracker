import { FilterIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "~/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { SCHEDULES, type Schedule } from "~/lib/constant";
import { type Filters, useFilters } from "~/lib/hooks/use-filters";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

type Props = {
	filtersDisplayed?: Array<keyof Filters>;
};

export const FiltersButton = ({
	filtersDisplayed = ["paymentMethods", "schedule", "users", "categories"],
}: Props) => {
	const t = useTranslations("Filters");
	const tSchedule = useTranslations("Common.schedule");
	const [filters, setFilters] = useFilters();
	const usersQuery = api.user.getAll.useQuery();
	const paymentMethodsQuery = api.paymentMethod.getAll.useQuery();
	const categoriesQuery = api.category.getAll.useQuery();

	if (
		usersQuery.isError ||
		paymentMethodsQuery.isError ||
		categoriesQuery.isError
	) {
		return null;
	}

	const paymentMethods = paymentMethodsQuery.data ?? [];
	const users = usersQuery.data ?? [];
	const categories = categoriesQuery.data ?? [];

	return (
		<div className="flex items-center gap-4">
			<Popover>
				<PopoverTrigger
					render={
						<Button
							size="icon"
							variant="ghost"
							disabled={
								usersQuery.isLoading ||
								paymentMethodsQuery.isLoading ||
								categoriesQuery.isLoading
							}
						>
							<FilterIcon
								size={24}
								className={cn(
									filters.schedule ||
										filters.users ||
										filters.paymentMethods.length > 0 ||
										filters.categories.length > 0
										? "fill-primary text-primary"
										: "`text-foreground",
								)}
							/>
						</Button>
					}
				/>
				<PopoverContent className="mr-3 w-fit min-w-50 gap-0 p-1">
					<PopoverHeader className="gap-0">
						<PopoverTitle className="px-2 py-1.5 font-medium text-muted-foreground text-xs">
							{t("label")}
						</PopoverTitle>
						<Separator className="my-1 -ml-1 w-[calc(100%+0.5rem)]" />
					</PopoverHeader>
					<div className="flex flex-col gap-2 p-2 pt-0">
						{filtersDisplayed.includes("users") && (
							<>
								<Label htmlFor="filters-users" className="mt-2">
									{t("users")}
								</Label>
								<Select
									id="filters-users"
									onValueChange={(value) =>
										setFilters({
											...filters,
											users: filters.users === value ? null : value,
										})
									}
									value={filters.users ?? ""}
									items={usersQuery.data?.map((u) => ({
										label: u.name,
										value: u.id,
									}))}
								>
									<SelectTrigger className="w-full capitalize">
										<SelectValue placeholder={t("select")} />
									</SelectTrigger>
									<SelectContent>
										{users.map((user) => (
											<SelectItem value={user.id} key={user.id}>
												{user.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</>
						)}
						{filtersDisplayed.includes("schedule") && (
							<>
								<Label htmlFor="filters-schedule" className="mt-2">
									{t("schedule")}
								</Label>
								<Select
									id="filters-schedule"
									onValueChange={(value) =>
										setFilters({
											...filters,
											schedule:
												filters.schedule === value ? null : (value as Schedule),
										})
									}
									value={filters.schedule ?? ""}
									itemToStringLabel={(v) => tSchedule(v as Schedule)}
								>
									<SelectTrigger className="w-full capitalize">
										<SelectValue placeholder={t("select")} />
									</SelectTrigger>
									<SelectContent>
										{SCHEDULES.map((schedule) => (
											<SelectItem value={schedule} key={schedule}>
												{tSchedule(schedule)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</>
						)}
						{filtersDisplayed.includes("paymentMethods") && (
							<>
								<Label htmlFor="filters-paymentMethods" className="mt-2">
									{t("paymentMethods")}
								</Label>
								<Select
									id="filters-paymentMethods"
									onValueChange={(value) =>
										setFilters({
											...filters,
											paymentMethods: value.map((v) => Number.parseInt(v, 10)),
										})
									}
									value={filters.paymentMethods.map((pm) => pm.toString())}
									multiple
									items={
										paymentMethods.map((pm) => ({
											label: pm.name,
											value: pm.id.toString(),
										})) ?? []
									}
								>
									<SelectTrigger className="w-full capitalize">
										<SelectValue placeholder={t("select")} />
									</SelectTrigger>
									<SelectContent>
										{paymentMethods.map((pm) => (
											<SelectItem value={pm.id.toString()} key={pm.id}>
												{pm.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</>
						)}
						{filtersDisplayed.includes("categories") && (
							<>
								<Label htmlFor="filters-categories" className="mt-2">
									{t("categories")}
								</Label>
								<Select
									id="filters-categories"
									onValueChange={(value) =>
										setFilters({
											...filters,
											categories: value.map((v) => Number.parseInt(v, 10)),
										})
									}
									value={filters.categories.map((pm) => pm.toString())}
									items={
										categories.map((pm) => ({
											label: pm.name,
											value: pm.id.toString(),
										})) ?? []
									}
									multiple
								>
									<SelectTrigger className="w-full capitalize">
										<SelectValue placeholder={t("select")} />
									</SelectTrigger>
									<SelectContent>
										{categories.map((pm) => (
											<SelectItem value={pm.id.toString()} key={pm.id}>
												{pm.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</>
						)}
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
};
