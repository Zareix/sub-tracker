import { zodResolver } from "@hookform/resolvers/zod";
import { defaultFilter } from "cmdk";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { iconNames } from "lucide-react/dynamic";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { api, type RouterOutputs } from "~/trpc/react";

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
	const t = useTranslations("SettingsPage");
	const tCommon = useTranslations("Common");
	const apiUtils = api.useUtils();
	const createCategoryMutation = api.category.create.useMutation({
		onSuccess: () => {
			toast.success(t("categories.createdSuccess"));
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
			toast.success(t("categories.editedSuccess"));
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
		resolver: zodResolver(categoryCreateSchema),
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
		<form onSubmit={form.handleSubmit(onSubmit)}>
			<FieldGroup>
				<Controller
					control={form.control}
					name="name"
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor="category-name">
								{tCommon("form.name")}
							</FieldLabel>
							<Input
								{...field}
								id="category-name"
								aria-invalid={fieldState.invalid}
								placeholder={t("categories.namePlaceholder")}
							/>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
				<Controller
					control={form.control}
					name="icon"
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid} className="flex flex-col">
							<FieldLabel htmlFor="category-icon">
								{tCommon("icon.label")}
							</FieldLabel>
							<div className="flex items-center gap-2">
								{field.value && <CategoryIcon icon={field.value} />}
								<Popover modal>
									<PopoverTrigger
										render={
											<Button
												id="category-icon"
												variant="outline"
												aria-invalid={fieldState.invalid}
												className={cn(
													"h-10 grow justify-between",
													!field.value && "text-muted-foreground",
												)}
											>
												{field.value
													? iconNames.find((name) => name === field.value)
													: tCommon("icon.select")}
												<ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
											</Button>
										}
									/>
									<PopoverContent className="w-50 p-0">
										<Command shouldFilter={false}>
											<CommandInput
												placeholder={tCommon("icon.search")}
												onValueChange={setSearch}
											/>
											<CommandList>
												<CommandEmpty>
													{!search || search === ""
														? tCommon("icon.searchFor")
														: tCommon("icon.noResults")}
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
															{name && <CategoryIcon icon={name} />}
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
							<FieldDescription>
								{tCommon("icon.findOn")}{" "}
								<a
									href="https://lucide.dev/icons/?focus"
									target="_blank"
									rel="noreferrer"
									className="text-blue-500 underline"
								>
									lucide.dev
								</a>
							</FieldDescription>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
				<DialogFooter>
					<Button type="submit">{tCommon("actions.submit")}</Button>
				</DialogFooter>
			</FieldGroup>
		</form>
	);
};
