import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { defaultFilter } from "cmdk";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { iconNames } from "lucide-react/dynamic";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4-mini";
import { CategoryIcon } from "~/components/subscriptions/categories/icon";
import { Button } from "~/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "~/components/ui/command";
import { DialogFooter } from "~/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import { type RouterOutputs, api } from "~/utils/api";

const categoryCreateSchema = z.object({
	name: z.string().check(
		z.minLength(1, {
			error: "Name is required",
		}),
	),
	icon: z.string().check(
		z.minLength(1, {
			error: "Icon is required",
		}),
	),
});

export const EditCreateForm = ({
	category,
	onFinished,
}: {
	category?: RouterOutputs["category"]["getAll"][number];
	onFinished?: () => void;
}) => {
	const apiUtils = api.useUtils();
	const createCategoryMutation = api.category.create.useMutation({
		onSuccess: () => {
			toast.success("Category created!");
			apiUtils.category.getAll.invalidate().catch(console.error);
			onFinished?.();
			setTimeout(() => {
				form.reset();
			}, 300);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
	const editCategoryMutation = api.category.edit.useMutation({
		onSuccess: () => {
			toast.success("Category edited!");
			apiUtils.category.getAll.invalidate().catch(console.error);
			onFinished?.();
			setTimeout(() => {
				form.reset();
			}, 300);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
	const [search, setSearch] = useState("");
	const filteredIconNames = useMemo(
		() =>
			iconNames
				.filter((name) => {
					if (!search || search === "") return false;
					return defaultFilter(name, search);
				})
				.slice(0, 100),
		[search],
	);

	const form = useForm<z.infer<typeof categoryCreateSchema>>({
		resolver: standardSchemaResolver(categoryCreateSchema),
		defaultValues: {
			name: category?.name ?? "",
			icon: category?.icon ?? "",
		},
	});

	function onSubmit(values: z.infer<typeof categoryCreateSchema>) {
		if (category) {
			editCategoryMutation.mutate({
				...values,
				id: category.id,
			});
		} else {
			createCategoryMutation.mutate(values);
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input placeholder="Raphael" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="icon"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<FormLabel>Icon</FormLabel>
							<div className="flex items-center gap-2">
								{field.value && <CategoryIcon icon={field.value} />}
								<Popover modal>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												variant="outline-t"
												className={cn(
													"h-10 grow justify-between",
													!field.value && "text-muted-foreground",
												)}
											>
												{field.value
													? iconNames.find((name) => name === field.value)
													: "Select icon"}
												<ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
											</Button>
										</FormControl>
									</PopoverTrigger>
									<PopoverContent className="w-[200px] p-0">
										<Command shouldFilter={false}>
											<CommandInput
												placeholder="Search icon..."
												onValueChange={setSearch}
											/>
											<CommandList>
												<CommandEmpty>
													{!search || search === ""
														? "Search for an icon"
														: "No results found."}
												</CommandEmpty>
												<CommandGroup>
													{filteredIconNames.map((name) => (
														<CommandItem
															value={name}
															key={name}
															onSelect={() => {
																form.setValue("icon", name);
															}}
														>
															{name}
															<CheckIcon
																className={cn(
																	"ml-auto",
																	name === field.value
																		? "opacity-100"
																		: "opacity-0",
																)}
															/>
														</CommandItem>
													))}
												</CommandGroup>
											</CommandList>
										</Command>
									</PopoverContent>
								</Popover>
							</div>
							<FormDescription>
								Find icon on{" "}
								<a
									href="https://lucide.dev/icons/?focus"
									target="_blank"
									rel="noreferrer"
									className="text-blue-500 underline"
								>
									lucide.dev
								</a>
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<DialogFooter>
					<Button type="submit">Submit</Button>
				</DialogFooter>
			</form>
		</Form>
	);
};
