import {
	Calendar1Icon,
	EditIcon,
	EllipsisVertical,
	InfoIcon,
	LinkIcon,
	RefreshCcwIcon,
	TextIcon,
	TrashIcon,
	UserIcon,
	WalletCardsIcon,
} from "lucide-react";
import Image from "next/image";
import { parseAsStringEnum, useQueryState } from "nuqs";
import React from "react";
import { useState } from "react";
import { CategoryIcon } from "~/components/subscriptions/categories/icon";
import { DeleteDialog } from "~/components/subscriptions/delete";
import { EditSubscriptionDialog } from "~/components/subscriptions/edit";
import { Accordion } from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";
import { BASE_CURRENCY } from "~/lib/constant";
import { SORTS } from "~/lib/constant";
import { useFilters } from "~/lib/hooks/use-filters";
import {
	currencyToSymbol,
	formatNextPaymentDate,
	getFilteredSubscriptions,
	getSortedSubscriptions,
} from "~/lib/utils";
import type { RouterOutputs } from "~/utils/api";

type Props = {
	subscriptions: RouterOutputs["subscription"]["getAll"];
};

export const SubscriptionList = ({ subscriptions }: Props) => {
	const [filters] = useFilters();

	const [sort] = useQueryState(
		"sort",
		parseAsStringEnum(SORTS.map((s) => s.key)),
	);

	const subs = getFilteredSubscriptions(
		getSortedSubscriptions(subscriptions, sort),
		filters,
	);

	if (subs.length === 0) {
		return (
			<div className="text-center text-muted-foreground">
				No subscriptions found
			</div>
		);
	}

	return (
		<Accordion type="single" collapsible>
			{subs.map((subscription) => (
				<React.Fragment key={subscription.id}>
					<SubscriptionListItem
						key={subscription.id}
						subscription={subscription}
					/>
					<Separator className="ml-auto w-[calc(100%-1rem-40px)] md:w-full" />
				</React.Fragment>
			))}
		</Accordion>
	);
};

const SubscriptionListItem = ({
	subscription,
}: {
	subscription: RouterOutputs["subscription"]["getAll"][number];
}) => {
	const [isOpen, setIsOpen] = useState({
		delete: false,
		edit: false,
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
								className="max-h-[48px] max-w-[40px] object-contain md:max-w-[64px]"
							/>
						)}
						<h2 className="grow font-semibold text-xl">{subscription.name}</h2>
						<div className="text-lg">{subscription.price}€</div>
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
		<Card className="border-none shadow-none">
			<CardContent>
				<div className="flex items-center gap-2">
					{subscription.image && (
						<Image
							src={subscription.image}
							alt={subscription.name}
							width={64}
							height={48}
							className="max-h-[48px] max-w-[40px] object-contain md:max-w-[64px]"
						/>
					)}
					<div className="flex grow flex-col gap-1">
						<h2 className="font-semibold text-xl">{subscription.name}</h2>
						<div className="flex items-center gap-1 text-muted-foreground text-sm">
							<Calendar1Icon size={16} />
							{formatNextPaymentDate(subscription.nextPaymentDate)}
						</div>
					</div>
					<div className="text-lg">{subscription.price}€</div>
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
								<span>Edit</span>
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
								<span>Delete</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<div className="flex flex-wrap gap-x-4 gap-y-2 pt-1 pl-12 text-base text-foreground/80 md:gap-x-6 md:pl-0">
					<div className="flex items-center gap-1">
						<UserIcon size={18} className="text-primary" />
						<span>{subscription.users.map((u) => u.name).join(", ")}</span>
					</div>
					<div className="flex items-center gap-1">
						{subscription.paymentMethod.image ? (
							<Image
								src={subscription.paymentMethod.image}
								alt={subscription.paymentMethod.name}
								width={20}
								height={20}
								className="max-h-[20px] max-w-[20px] object-contain"
							/>
						) : (
							<WalletCardsIcon size={18} className="text-primary" />
						)}
						<span>{subscription.paymentMethod.name}</span>
					</div>
					<div className="flex items-center gap-1">
						<CategoryIcon
							icon={subscription.category.icon}
							size={16}
							className="text-primary"
						/>
						{subscription.category.name}
					</div>
					<div className="flex items-center gap-1">
						<RefreshCcwIcon size={16} className="text-primary" />
						{subscription.schedule}
					</div>
					{subscription.currency !== BASE_CURRENCY && (
						<div className="flex items-center gap-0.5">
							<span className="text-primary">
								{currencyToSymbol(subscription.currency)}
							</span>
							{subscription.originalPrice}
						</div>
					)}
					{subscription.description.length > 0 && (
						<div className="flex items-center gap-1">
							<TextIcon size={20} className="text-primary" />
							<span>{subscription.description}</span>
						</div>
					)}
					{subscription.url && (
						<a
							href={subscription.url}
							target="_blank"
							rel="noopener noreferrer"
						>
							<div className="flex items-center gap-1">
								<LinkIcon size={16} className="text-primary" />
								{new URL(subscription.url).hostname}
							</div>
						</a>
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
			</CardContent>
		</Card>
	);
};
