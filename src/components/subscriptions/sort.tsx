import { SortAscIcon, SortDescIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { SORTS, type Sort } from "~/lib/constant";
import { useSort } from "~/lib/hooks/use-sort";
import { cn } from "~/lib/utils";

export const SortButton = () => {
	const t = useTranslations("Sort");
	const [sort, setSort] = useSort();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon">
					{sort?.endsWith("ASC") ? (
						<SortAscIcon
							size={24}
							className={cn(
								sort ? "fill-primary text-primary" : "`text-foreground",
							)}
						/>
					) : (
						<SortDescIcon
							size={24}
							className={cn(
								sort ? "fill-primary text-primary" : "`text-foreground",
							)}
						/>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56">
				<DropdownMenuLabel>{t("label")}</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuRadioGroup
					value={sort ?? ""}
					onValueChange={(v) => setSort(v === sort ? null : (v as Sort))}
				>
					{SORTS.map((s) => (
						<DropdownMenuRadioItem
							key={s.key}
							value={s.key}
							className="capitalize"
						>
							{t(s.labelKey)}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
