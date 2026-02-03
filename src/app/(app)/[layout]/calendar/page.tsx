"use client";

import { addMonths, isBefore, isSameDay, subMonths } from "date-fns";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Calendar, CalendarDayButton } from "~/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import { cn, currencyToSymbol } from "~/lib/utils";
import { api } from "~/trpc/react";

export default function CalendarPage() {
	const t = useTranslations("CalendarPage");
	const subscriptionsQuery = api.subscription.getAll.useQuery();

	return (
		<div>
			<header>
				<h1 className="font-bold text-3xl">{t("title")}</h1>
			</header>
			<div className="mt-2">
				{subscriptionsQuery.isLoading ? (
					<p>{t("loading")}</p>
				) : subscriptionsQuery.isError || !subscriptionsQuery.data ? (
					<p>{t("error")}</p>
				) : (
					<Calendar
						mode="single"
						startMonth={subMonths(new Date(), 1)}
						endMonth={addMonths(new Date(), 1)}
						className="w-full rounded-lg border sm:max-w-md"
						buttonVariant="ghost"
						components={{
							DayButton: ({ className, day, modifiers, ...props }) => {
								const [isOpen, setIsOpen] = useState(false);
								const dueSubscriptions = subscriptionsQuery.data.filter(
									(sub) =>
										isSameDay(day.date, sub.nextPaymentDate) ||
										isSameDay(day.date, sub.previousPaymentDate) ||
										isSameDay(day.date, sub.secondNextPaymentDate),
								);

								if (dueSubscriptions?.length === 0) {
									return (
										<CalendarDayButton
											className={className}
											day={day}
											modifiers={{
												...modifiers,
												selected: false,
											}}
											{...props}
										/>
									);
								}

								return (
									<Popover open={isOpen} onOpenChange={setIsOpen}>
										<PopoverTrigger asChild>
											<CalendarDayButton
												className={cn(
													className,
													isBefore(day.date, new Date()) && "bg-primary/50!",
												)}
												day={day}
												modifiers={{
													...modifiers,
													selected: true,
												}}
												{...props}
												onClick={() => setIsOpen(true)}
											/>
										</PopoverTrigger>
										<PopoverContent className="flex max-w-md flex-col p-4">
											{dueSubscriptions?.map((subscription) => (
												<div
													key={subscription.id}
													className="not-first:mt-2 flex items-center gap-2 not-first:border-t not-first:pt-2"
												>
													{subscription.image && (
														<Image
															src={subscription.image}
															alt={subscription.name}
															width={64}
															height={48}
															className="max-h-6 max-w-5 object-contain"
														/>
													)}
													<h4 className="grow font-semibold">
														{subscription.name}
													</h4>
													<span>
														{subscription.price}
														{currencyToSymbol(subscription.currency)}
													</span>
												</div>
											))}
										</PopoverContent>
									</Popover>
								);
							},
						}}
					/>
				)}
			</div>
		</div>
	);
}
