import { compareAsc, isBefore, isThisMonth } from "date-fns";
import {
	Calendar1Icon,
	CopyPlusIcon,
	EditIcon,
	EllipsisVertical,
	ExternalLinkIcon,
	InfoIcon,
	RefreshCcwIcon,
	TextIcon,
	TrashIcon,
	UserIcon,
	WalletCardsIcon,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { CategoryIcon } from "~/components/subscriptions/categories/icon";
import { DeleteDialog } from "~/components/subscriptions/delete";
import { DuplicateSubscriptionDialog } from "~/components/subscriptions/duplicate";
import { EditSubscriptionDialog } from "~/components/subscriptions/edit";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";
import { authClient } from "~/lib/auth-client";
import { type Currencies, DEFAULT_BASE_CURRENCY } from "~/lib/constant";
import { useFilters } from "~/lib/hooks/use-filters";
import { useSort } from "~/lib/hooks/use-sort";
import {
	cn,
	currencyToSymbol,
	formatNextPaymentDate,
	getFilteredSubscriptions,
	getSortedSubscriptions,
} from "~/lib/utils";
import type { RouterOutputs } from "~/trpc/react";

type Props = {
	subscriptions: RouterOutputs["subscription"]["getAll"];
};

export const SubscriptionList = ({ subscriptions }: Props) => {
	const t = useTranslations("SubscriptionList");
	const tSchedule = useTranslations("Common.schedule");
	const [filters] = useFilters();
	const [sort] = useSort();
	const { data: session } = authClient.useSession();
	const [arePreviousPaymentsShown, setArePreviousPaymentsShown] =
		useState(false);

	const userBaseCurrency =
		(session?.user?.baseCurrency as (typeof Currencies)[number]) ??
		DEFAULT_BASE_CURRENCY;

	const subs = getFilteredSubscriptions(
		getSortedSubscriptions(subscriptions, sort),
		filters,
	);

	if (subs.length === 0) {
		return (
			<div className="text-center text-muted-foreground">
				{t("noSubscriptionsFound")}
			</div>
		);
	}

	const previousSubOfThisMonths = subs
		.filter(
			(s) =>
				isThisMonth(s.previousPaymentDate) &&
				isBefore(s.previousPaymentDate, new Date()),
		)
		.toSorted((a, b) =>
			compareAsc(a.previousPaymentDate, b.previousPaymentDate),
		);

	return (
		<>
			{arePreviousPaymentsShown
				? previousSubOfThisMonths.map((subscription) => (
						<React.Fragment key={subscription.id}>
							<SubscriptionListItem
								key={subscription.id}
								subscription={subscription}
								userBaseCurrency={userBaseCurrency}
								isPrevious
								tSchedule={tSchedule}
							/>
							<Separator className="w-full" />
						</React.Fragment>
					))
				: previousSubOfThisMonths.length > 0 && (
						<div className="mx-auto flex max-w-[90vw] items-center justify-center overflow-x-hidden">
							<Separator className="w-32" />
							<Button
								variant="outline-t"
								onClick={() => setArePreviousPaymentsShown(true)}
							>
								{t("showPreviousPayments")}
							</Button>
							<Separator className="w-32" />
						</div>
					)}
			{subs.map((subscription) => (
				<React.Fragment key={subscription.id}>
					<SubscriptionListItem
						key={subscription.id}
						subscription={subscription}
						userBaseCurrency={userBaseCurrency}
						tSchedule={tSchedule}
					/>
					<Separator className="w-full" />
				</React.Fragment>
			))}
		</>
	);
};

const SubscriptionListItem = ({
	subscription,
	userBaseCurrency,
	isPrevious = false,
	tSchedule,
}: {
	subscription: RouterOutputs["subscription"]["getAll"][number];
	userBaseCurrency: string;
	isPrevious?: boolean;
	tSchedule: ReturnType<typeof useTranslations<"Common.schedule">>;
}) => {
	const t = useTranslations("SubscriptionList");
	const [filters, setFilters] = useFilters();
	const [isOpen, setIsOpen] = useState({
		delete: false,
		edit: false,
		duplicate: false,
	});

	if (subscription.id === -1) {
		return (
			<Card className="mt-3 border-none opacity-50 shadow-none">
				<CardContent>
					<div className="flex items-center gap-2">
						{subscription.image && (
							<Image
								src={subscription.image}
								alt={subscription.name}
								width={64}
								height={48}
								className="max-h-12 max-w-10 object-contain md:max-w-16"
							/>
						)}
						<h2 className="grow font-semibold text-xl">{subscription.name}</h2>
						<div className="text-lg">
							{subscription.price}
							{currencyToSymbol(subscription.currency)}
						</div>
						<Button
							size="icon"
							variant="ghost"
							className="w-4 md:w-10"
							disabled
						>
							<EllipsisVertical size={24} />
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={cn("border-none shadow-none", isPrevious && "opacity-50")}>
			<CardContent>
				<div className="flex items-center gap-2">
					{subscription.image && (
						<Image
							src={subscription.image}
							alt={subscription.name}
							width={64}
							height={48}
							className="max-h-12 max-w-10 object-contain md:max-w-16"
						/>
					)}
					<div className="flex grow flex-col gap-1">
						<h2 className="font-semibold text-xl">{subscription.name}</h2>
						<div className="flex items-center gap-1 text-muted-foreground text-sm">
							<Calendar1Icon size={16} />
							{formatNextPaymentDate(
								isPrevious
									? subscription.previousPaymentDate
									: subscription.nextPaymentDate,
							)}
						</div>
					</div>
					<div className="text-lg">
						{subscription.price}
						{currencyToSymbol(userBaseCurrency)}
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								size="icon"
								variant="ghost"
								className="w-5 text-muted-foreground md:w-10"
							>
								<InfoIcon size={20} />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="mr-2 w-32"
							onClick={(e) => e.stopPropagation()}
						>
							<DropdownMenuItem
								onClick={() => setIsOpen({ ...isOpen, edit: true })}
							>
								<EditIcon />
								<span>{t("edit")}</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => setIsOpen({ ...isOpen, duplicate: true })}
							>
								<CopyPlusIcon />
								<span>{t("duplicate")}</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								className="text-destructive"
								onClick={() =>
									setIsOpen({
										...isOpen,
										delete: true,
									})
								}
							>
								<TrashIcon />
								<span>{t("delete")}</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<div className="flex flex-wrap gap-x-4 gap-y-2 pt-1 text-base text-foreground/80 md:gap-x-6">
					<div className="flex items-center gap-1">
						<UserIcon size={18} className="text-primary" />
						<span>{subscription.users.map((u) => u.name).join(", ")}</span>
					</div>
					<button
						type="button"
						className="flex items-center gap-1"
						onClick={() =>
							setFilters({
								...filters,
								paymentMethods:
									filters.paymentMethods.length > 1
										? filters.paymentMethods
										: filters.paymentMethods[0] ===
												subscription.paymentMethod.id
											? []
											: [subscription.paymentMethod.id],
							})
						}
					>
						{subscription.paymentMethod.image ? (
							<Image
								src={subscription.paymentMethod.image}
								alt={subscription.paymentMethod.name}
								width={20}
								height={20}
								className="max-h-5 max-w-5 object-contain"
							/>
						) : (
							<WalletCardsIcon size={18} className="text-primary" />
						)}
						<span>{subscription.paymentMethod.name}</span>
					</button>
					<button
						type="button"
						className="flex items-center gap-1"
						onClick={() =>
							setFilters({
								...filters,
								categories:
									filters.categories.length > 1
										? filters.categories
										: filters.categories[0] === subscription.category.id
											? []
											: [subscription.category.id],
							})
						}
					>
						<CategoryIcon
							icon={subscription.category.icon}
							size={16}
							className="text-primary"
						/>
						{subscription.category.name}
					</button>
					<button
						type="button"
						className="flex items-center gap-1"
						onClick={() =>
							setFilters({
								...filters,
								schedule:
									filters.schedule === subscription.schedule
										? null
										: subscription.schedule,
							})
						}
					>
						<RefreshCcwIcon size={16} className="text-primary" />
						{tSchedule(subscription.schedule)}
					</button>
					{subscription.currency !== userBaseCurrency && (
						<div className="flex items-center gap-0.5">
							<span className="text-primary">
								{currencyToSymbol(subscription.currency)}
							</span>
							{subscription.originalPrice}
						</div>
					)}
					{subscription.url && (
						<a
							href={subscription.url}
							target="_blank"
							rel="noopener noreferrer"
						>
							<div className="flex items-center gap-1">
								<ExternalLinkIcon size={16} className="text-primary" />
								{new URL(subscription.url).hostname}
							</div>
						</a>
					)}
					{subscription.description.length > 0 && (
						<div className="flex items-center gap-1">
							<TextIcon size={20} className="text-primary" />
							<span className="max-w-[80vw] overflow-x-clip overflow-ellipsis whitespace-nowrap md:whitespace-pre-wrap">
								{subscription.description}
							</span>
						</div>
					)}
				</div>
				<DeleteDialog
					subscription={subscription}
					isOpen={isOpen.delete}
					setIsOpen={() => setIsOpen({ ...isOpen, delete: false })}
				/>
				<EditSubscriptionDialog
					subscription={subscription}
					isOpen={isOpen.edit}
					setIsOpen={() => setIsOpen({ ...isOpen, edit: false })}
				/>
				<DuplicateSubscriptionDialog
					subscription={subscription}
					isOpen={isOpen.duplicate}
					setIsOpen={() => setIsOpen({ ...isOpen, duplicate: false })}
				/>
			</CardContent>
		</Card>
	);
};
