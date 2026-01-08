"use client";

import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsString, useQueryState } from "nuqs";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";

export const SearchBar = () => {
	const t = useTranslations("SearchBar");
	const [search, setSearch] = useQueryState(
		"search",
		parseAsString.withDefault(""),
	);

	const handleClear = () => {
		setSearch(null);
	};

	return (
		<div className="relative w-full">
			<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				type="search"
				placeholder={t("placeholder")}
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				className="pr-9 pl-9"
			/>
			<Button
				type="button"
				variant="ghost"
				size="icon"
				onClick={handleClear}
				className={cn(
					"absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 transition-opacity",
					search ? "opacity-100" : "pointer-events-none opacity-0",
				)}
			>
				<X className="h-4 w-4" />
				<span className="sr-only">{t("clearSearch")}</span>
			</Button>
		</div>
	);
};
