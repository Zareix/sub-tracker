import { Label } from "@radix-ui/react-label";
import { FilterIcon, TrashIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { MultiSelect } from "~/components/ui/multi-select";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { SCHEDULES, type Schedule } from "~/lib/constant";
import { type Filters, useFilters } from "~/lib/hooks/use-filters";
import { cn } from "~/lib/utils";
import { api } from "~/utils/api";

type Props = {
	filtersDisplayed?: Array<keyof Filters>;
};

export const FiltersButton = ({
	filtersDisplayed = ["paymentMethods", "schedule", "users", "categories"],
}: Props) => {
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
				<PopoverTrigger asChild>
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
				</PopoverTrigger>
				<PopoverContent className="mr-3 flex w-fit flex-col gap-2 p-4">
					{filtersDisplayed.includes("users") && (
						<>
							<Label className="mt-2">Users</Label>
							<div className="flex items-center gap-2">
								<Select
									onValueChange={(value) =>
										setFilters({
											...filters,
											users: value,
										})
									}
									value={filters.users ?? ""}
								>
									<SelectTrigger
										className={cn(
											"capitalize",
											filters.users ? "w-[160px]" : "w-[200px]",
										)}
									>
										<SelectValue placeholder="Select..." />
									</SelectTrigger>
									<SelectContent>
										{users.map((user) => (
											<SelectItem value={user.id} key={user.id}>
												{user.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{filters.users && (
									<Button
										variant="destructive"
										size="icon"
										onClick={() => setFilters({ ...filters, users: null })}
									>
										<TrashIcon className="size-5" />
									</Button>
								)}
							</div>
						</>
					)}
					{filtersDisplayed.includes("schedule") && (
						<>
							<Label>Schedule</Label>
							<div className="flex items-center gap-2">
								<Select
									onValueChange={(value) =>
										setFilters({
											...filters,
											schedule: value as Schedule,
										})
									}
									value={filters.schedule ?? ""}
								>
									<SelectTrigger
										className={cn(
											"capitalize",
											filters.schedule ? "w-[160px]" : "w-[200px]",
										)}
									>
										<SelectValue placeholder="Select..." />
									</SelectTrigger>
									<SelectContent>
										{SCHEDULES.map((schedule) => (
											<SelectItem value={schedule} key={schedule}>
												{schedule}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{filters.schedule && (
									<Button
										variant="destructive"
										size="icon"
										onClick={() => setFilters({ ...filters, schedule: null })}
									>
										<TrashIcon className="size-5" />
									</Button>
								)}
							</div>
						</>
					)}

					{filtersDisplayed.includes("paymentMethods") && (
						<>
							<Label className="mt-2">Payment Methods</Label>
							<MultiSelect
								options={
									paymentMethods.map((pm) => ({
										label: pm.name,
										value: pm.id.toString(),
									})) ?? []
								}
								search={false}
								maxCount={0}
								onValueChange={(value) =>
									setFilters({
										...filters,
										paymentMethods: value.map((v) => Number.parseInt(v, 10)),
									})
								}
								className="bg-background"
								defaultValue={filters.paymentMethods.map((pm) => pm.toString())}
								placeholder="Select..."
							/>
						</>
					)}
					{filtersDisplayed.includes("categories") && (
						<>
							<Label className="mt-2">Categories</Label>
							<MultiSelect
								options={
									categories.map((pm) => ({
										label: pm.name,
										value: pm.id.toString(),
									})) ?? []
								}
								className="bg-background"
								search={false}
								maxCount={0}
								onValueChange={(value) =>
									setFilters({
										...filters,
										categories: value.map((v) => Number.parseInt(v, 10)),
									})
								}
								defaultValue={filters.categories.map((pm) => pm.toString())}
								placeholder="Select..."
							/>
						</>
					)}
				</PopoverContent>
			</Popover>
		</div>
	);
};
