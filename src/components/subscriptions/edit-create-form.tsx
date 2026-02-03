import { zodResolver } from "@hookform/resolvers/zod";
import { addYears, format, subYears } from "date-fns";
import { CalendarIcon } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4-mini";
import { ImageFileUploader } from "~/components/image-uploader";
import { CategoryIcon } from "~/components/subscriptions/categories/icon";
import { ImageSearch } from "~/components/subscriptions/image-search";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { DialogFooter } from "~/components/ui/dialog";
import {
	Field,
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { authClient } from "~/lib/auth-client";
import { Currencies, SCHEDULES } from "~/lib/constant";
import { cn } from "~/lib/utils";
import { api, type RouterInputs, type RouterOutputs } from "~/trpc/react";

const createTempSub = (subscription: RouterInputs["subscription"]["create"]) =>
	({
		...subscription,
		id: -1,
		createdAt: new Date(),
		updatedAt: new Date(),
		originalPrice: subscription.price,
		nextPaymentDate: new Date(),
		secondNextPaymentDate: new Date(),
		previousPaymentDate: new Date(),
		image: null,
		users: [],
		paymentMethod: {
			id: -1,
			name: "temp",
			image: null,
		},
		category: {
			id: -1,
			name: "temp",
			icon: "temp",
		},
		url: null,
	}) satisfies RouterOutputs["subscription"]["getAll"][number];

export const EditCreateForm = ({
	subscription,
	onFinished,
}: {
	subscription?: Omit<RouterOutputs["subscription"]["getAll"][number], "id"> & {
		id?: number;
	};
	onFinished?: () => void;
}) => {
	const t = useTranslations("SubscriptionForm");
	const tCommon = useTranslations("Common");
	const session = authClient.useSession();
	const apiUtils = api.useUtils();

	const subscriptionCreateSchema = z.object({
		name: z
			.string()
			.check(z.minLength(1, { error: t("validation.nameRequired") })),
		description: z.string(),
		category: z.coerce
			.number<number>({
				error: t("validation.categoryRequired"),
			})
			.check(
				z.positive({
					error: t("validation.categoryRequired"),
				}),
			),
		image: z.optional(z.string()),
		price: z.coerce.number<number>().check(
			z.positive({
				error: t("validation.pricePositive"),
			}),
		),
		currency: z.enum(Currencies),
		paymentMethod: z.coerce
			.number<number>({
				error: t("validation.paymentMethodRequired"),
			})
			.check(
				z.positive({
					error: t("validation.paymentMethodRequired"),
				}),
			),
		firstPaymentDate: z.date({
			error: t("validation.firstPaymentDateRequired"),
		}),
		schedule: z.enum(SCHEDULES),
		payedBy: z.array(z.string()).check(
			z.minLength(1, {
				error: t("validation.userRequired"),
			}),
		),
		url: z.optional(z.url()),
	});

	const createSubscriptionMutation = api.subscription.create.useMutation({
		onSuccess: () => {
			toast.success(t("create.success"), {
				duration: Number.POSITIVE_INFINITY,
			});
			onFinished?.();
			setTimeout(() => {
				form.reset();
			}, 300);
		},
		onMutate: async (newSubscription) => {
			await apiUtils.subscription.getAll.cancel();

			const previousSubs = apiUtils.subscription.getAll.getData();

			apiUtils.subscription.getAll.setData(undefined, (old) =>
				!old
					? []
					: [...old, createTempSub(newSubscription)].sort((a, b) =>
							a.name.localeCompare(b.name),
						),
			);

			return { previousSubs };
		},
		onError: (err, _, context) => {
			toast.error(err.message);
			apiUtils.subscription.getAll.setData(undefined, context?.previousSubs);
		},
		onSettled: () => {
			apiUtils.subscription.getAll.invalidate().catch(console.error);
		},
	});
	const editSubscriptionMutation = api.subscription.edit.useMutation({
		onSuccess: () => {
			toast.success(t("edit.success"));
			onFinished?.();
			setTimeout(() => {
				form.reset();
			}, 300);
		},
		onMutate: async (newSubscription) => {
			await apiUtils.subscription.getAll.cancel();

			const previousSubs = apiUtils.subscription.getAll.getData();

			apiUtils.subscription.getAll.setData(undefined, (old) => {
				if (!old) {
					return [];
				}
				const index = old.findIndex((s) => s.id === newSubscription.id);
				const oldSub = old[index];
				if (index === -1 || !oldSub) {
					return old;
				}
				return [
					...old.slice(0, index),
					{
						...oldSub,
						name: newSubscription.name,
						description: newSubscription.description,
						price: newSubscription.price,
						currency: newSubscription.currency,
						firstPaymentDate: newSubscription.firstPaymentDate,
						schedule: newSubscription.schedule,
						image: newSubscription.image ?? null,
					},
					...old.slice(index + 1),
				];
			});

			return { previousSubs };
		},
		onError: (err, _, context) => {
			toast.error(err.message);
			apiUtils.subscription.getAll.setData(undefined, context?.previousSubs);
		},
		onSettled: () => {
			apiUtils.subscription.getAll.invalidate().catch(console.error);
		},
	});
	const usersQuery = api.user.getAll.useQuery();
	const paymentMethodsQuery = api.paymentMethod.getAll.useQuery();
	const categoriesQuery = api.category.getAll.useQuery();
	const form = useForm<z.infer<typeof subscriptionCreateSchema>>({
		resolver: zodResolver(subscriptionCreateSchema),
		defaultValues: {
			name: subscription?.name ?? "",
			description: subscription?.description ?? "",
			category: subscription?.category.id ?? 1,
			image: subscription?.image ?? undefined,
			price: subscription?.originalPrice ?? 0,
			currency:
				subscription?.currency ?? session.data?.user.baseCurrency ?? "EUR",
			paymentMethod: subscription?.paymentMethod.id,
			schedule: subscription?.schedule ?? "Monthly",
			firstPaymentDate: subscription?.firstPaymentDate,
			payedBy:
				subscription?.users.map((u) => u.id) ??
				(session.data?.user.id ? [session.data.user.id] : []),
			url: subscription?.url ?? undefined,
		},
	});

	function onSubmit(values: z.infer<typeof subscriptionCreateSchema>) {
		if (subscription?.id) {
			editSubscriptionMutation.mutate({
				...values,
				id: subscription.id,
			});
		} else {
			createSubscriptionMutation.mutate(values);
		}
	}

	return (
		<>
			{usersQuery.isLoading ||
			paymentMethodsQuery.isLoading ||
			categoriesQuery.isLoading ? (
				<div>{t("loading")}</div>
			) : usersQuery.isError ||
				paymentMethodsQuery.isError ||
				categoriesQuery.isError ? (
				<div>
					{tCommon("error")}:{" "}
					{usersQuery.error?.message ?? paymentMethodsQuery.error?.message}
				</div>
			) : (
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<FieldGroup>
						<div className="grid grid-cols-12 items-center gap-2">
							<Controller
								control={form.control}
								name="name"
								render={({ field, fieldState }) => (
									<Field
										data-invalid={fieldState.invalid}
										className="col-span-8"
									>
										<FieldLabel htmlFor="subscription-name">
											{t("fields.name")}
										</FieldLabel>
										<Input
											{...field}
											id="subscription-name"
											aria-invalid={fieldState.invalid}
											placeholder={t("fields.namePlaceholder")}
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
							<ImageFileUploader
								setFileUrl={(v) => form.setValue("image", v)}
								fileUrl={form.watch("image")}
							/>
							<ImageSearch
								query={form.watch("name")}
								setFileUrl={(v) => form.setValue("image", v)}
							/>
						</div>
						<div className="flex">
							<Controller
								control={form.control}
								name="category"
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="subscription-category">
											{t("fields.category")}
										</FieldLabel>
										<Select
											name={field.name}
											value={field.value?.toString()}
											onValueChange={field.onChange}
											items={
												categoriesQuery.data?.map((p) => ({
													value: p.id.toString(),
													label: (
														<>
															{p.icon && (
																<CategoryIcon
																	icon={p.icon}
																	className="max-h-5 max-w-5 object-contain"
																/>
															)}
															{p.name}
														</>
													),
												})) ?? []
											}
										>
											<SelectTrigger
												id="subscription-category"
												aria-invalid={fieldState.invalid}
												className="min-w-42.5"
											>
												<SelectValue
													placeholder={t("fields.categoryPlaceholder")}
												/>
											</SelectTrigger>
											<SelectContent>
												{categoriesQuery.data?.map((p) => (
													<SelectItem value={p.id.toString()} key={p.id}>
														<div className="flex items-center gap-1">
															{p.icon && (
																<CategoryIcon
																	icon={p.icon}
																	className="max-h-5 max-w-5 object-contain"
																/>
															)}
															{p.name}
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
							<Separator
								orientation="vertical"
								className="mx-2 my-auto flex h-12"
							/>
							<Controller
								control={form.control}
								name="url"
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="subscription-url">
											{t("fields.url")}
										</FieldLabel>
										<Input
											{...field}
											id="subscription-url"
											aria-invalid={fieldState.invalid}
											placeholder={t("fields.urlPlaceholder")}
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
						</div>
						<Controller
							control={form.control}
							name="description"
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="subscription-description">
										{t("fields.description")}
									</FieldLabel>
									<Input
										{...field}
										id="subscription-description"
										aria-invalid={fieldState.invalid}
										placeholder={t("fields.descriptionPlaceholder")}
									/>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>
						<div className="grid grid-cols-2 gap-3">
							<div className="flex">
								<Controller
									control={form.control}
									name="price"
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid} className="grow">
											<FieldLabel htmlFor="subscription-price">
												{t("fields.price")}
											</FieldLabel>
											<Input
												{...field}
												id="subscription-price"
												type="number"
												aria-invalid={fieldState.invalid}
												placeholder={t("fields.pricePlaceholder")}
												className="rounded-r-none"
											/>
											{fieldState.invalid && (
												<FieldError errors={[fieldState.error]} />
											)}
										</Field>
									)}
								/>
								<Controller
									control={form.control}
									name="currency"
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor="subscription-currency">
												{t("fields.currency")}
											</FieldLabel>
											<Select
												name={field.name}
												value={field.value}
												onValueChange={field.onChange}
											>
												<SelectTrigger
													id="subscription-currency"
													aria-invalid={fieldState.invalid}
													className="rounded-l-none border-l-0"
												>
													<SelectValue
														placeholder={t("fields.currencyPlaceholder")}
													/>
												</SelectTrigger>
												<SelectContent>
													{Currencies.map((s) => (
														<SelectItem value={s} key={s}>
															{s}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											{fieldState.invalid && (
												<FieldError errors={[fieldState.error]} />
											)}
										</Field>
									)}
								/>
							</div>
							<Controller
								control={form.control}
								name="paymentMethod"
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="subscription-payment-method">
											{t("fields.paymentMethod")}
										</FieldLabel>
										<Select
											name={field.name}
											defaultValue={field.value?.toString()}
											onValueChange={field.onChange}
											items={
												paymentMethodsQuery.data?.map((p) => ({
													value: p.id.toString(),
													label: (
														<>
															{p.image && (
																<Image
																	src={p.image}
																	alt={p.name}
																	width={64}
																	height={40}
																	className="max-h-5 max-w-5 object-contain"
																/>
															)}
															{p.name}
														</>
													),
												})) ?? []
											}
										>
											<SelectTrigger
												id="subscription-payment-method"
												aria-invalid={fieldState.invalid}
												className="w-full"
											>
												<SelectValue
													placeholder={t("fields.paymentMethodPlaceholder")}
												/>
											</SelectTrigger>
											<SelectContent>
												{paymentMethodsQuery.data?.map((p) => (
													<SelectItem value={p.id.toString()} key={p.id}>
														<div className="flex items-center gap-1">
															{p.image && (
																<Image
																	src={p.image}
																	alt={p.name}
																	width={64}
																	height={40}
																	className="max-h-5 max-w-5 object-contain"
																/>
															)}
															{p.name}
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
						</div>
						<Controller
							control={form.control}
							name="payedBy"
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid} className="grow">
									<FieldLabel htmlFor="subscription-payed-by">
										{t("fields.payedBy")}
									</FieldLabel>
									<Select
										name={field.name}
										value={field.value}
										onValueChange={field.onChange}
										multiple
										items={
											usersQuery.data?.map((p) => ({
												value: p.id,
												label: p.name,
											})) ?? []
										}
									>
										<SelectTrigger
											id="subscription-payed-by"
											aria-invalid={fieldState.invalid}
											className="w-full"
										>
											<SelectValue
												placeholder={t("fields.payedByPlaceholder")}
											/>
										</SelectTrigger>
										<SelectContent>
											{usersQuery.data?.map((p) => (
												<SelectItem value={p.id.toString()} key={p.id}>
													<div className="flex items-center gap-1">
														{p.name}
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>
						<div className="flex gap-2">
							<Controller
								control={form.control}
								name="schedule"
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid} className="min-w-40">
										<FieldLabel htmlFor="subscription-schedule">
											{t("fields.schedule")}
										</FieldLabel>
										<Select
											name={field.name}
											value={field.value}
											onValueChange={field.onChange}
											items={SCHEDULES.map((s) => ({
												label: tCommon(`schedule.${s}`),
												value: s,
											}))}
										>
											<SelectTrigger
												id="subscription-schedule"
												aria-invalid={fieldState.invalid}
												className="w-full"
											>
												<SelectValue
													placeholder={t("fields.schedulePlaceholder")}
												/>
											</SelectTrigger>
											<SelectContent>
												{SCHEDULES.map((s) => (
													<SelectItem value={s} key={s}>
														{tCommon(`schedule.${s}`)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
							<Controller
								control={form.control}
								name="firstPaymentDate"
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid} className="grow">
										<FieldLabel htmlFor="subscription-first-payment-date">
											{t("fields.firstPaymentDate")}
										</FieldLabel>
										<Popover modal>
											<PopoverTrigger
												render={
													<Button
														id="subscription-first-payment-date"
														data-testid="firstPaymentDatePicker"
														variant="outline"
														aria-invalid={fieldState.invalid}
														className={cn(
															"h-9 w-full justify-start text-left font-normal",
															!field.value && "text-muted-foreground",
														)}
													>
														<CalendarIcon className="mr-2 size-4" />
														{field.value ? (
															format(field.value, "dd/MM/yyyy")
														) : (
															<span>{t("fields.pickDate")}</span>
														)}
													</Button>
												}
											/>
											<PopoverContent className="pointer-events-auto w-auto p-0">
												<Calendar
													mode="single"
													selected={field.value}
													onSelect={field.onChange}
													autoFocus
													captionLayout="dropdown"
													startMonth={subYears(new Date(), 10)}
													endMonth={addYears(new Date(), 10)}
												/>
											</PopoverContent>
										</Popover>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
						</div>
						<DialogFooter>
							<Button
								type="submit"
								isLoading={
									createSubscriptionMutation.isPending ||
									editSubscriptionMutation.isPending
								}
							>
								{tCommon("actions.submit")}
							</Button>
						</DialogFooter>
					</FieldGroup>
				</form>
			)}
		</>
	);
};
