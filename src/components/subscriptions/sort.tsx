import { SortAscIcon, SortDescIcon } from "lucide-react";
import { parseAsStringEnum, useQueryState } from "nuqs";
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
import { type Sort, SORTS } from "~/lib/constant";
import { cn } from "~/lib/utils";

export const SortButton = () => {
  const [sort, setSort] = useQueryState(
    "sort",
    parseAsStringEnum(SORTS.map((s) => s.key)),
  );

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
        <DropdownMenuLabel>Sort</DropdownMenuLabel>
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
              {s.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
