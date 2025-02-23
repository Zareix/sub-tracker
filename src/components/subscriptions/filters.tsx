import { Button } from "~/components/ui/button";
import { ChevronsUpDown, FilterIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useState } from "react";
import { filtersSchema } from "~/server/api/routers/schema";
import { api } from "~/utils/api";
import { SCHEDULES } from "~/lib/constant";
import { Label } from "@radix-ui/react-label";
import { useQueryState, parseAsJson } from "nuqs";

export const FiltersButton = () => {
  const [filters, setFilters] = useQueryState("filters", {
    ...parseAsJson(filtersSchema.parse),
    defaultValue: {
      schedule: null,
      paymentMethodId: null,
      users: null,
    },
  });
  const [isOpen, setIsOpen] = useState({
    schedule: false,
    paymentMethod: false,
    users: false,
  });

  const usersQuery = api.user.getAll.useQuery();
  const paymentMethodsQuery = api.paymentMethod.getAll.useQuery();

  if (usersQuery.isLoading || paymentMethodsQuery.isLoading) {
    return <></>;
  }

  if (
    usersQuery.isError ||
    paymentMethodsQuery.isError ||
    !paymentMethodsQuery.data ||
    !usersQuery.data
  ) {
    return <></>;
  }

  const paymentMethods = paymentMethodsQuery.data;
  const users = usersQuery.data;

  return (
    <div className="flex items-center gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button size="icon" variant="ghost">
            <FilterIcon
              size={24}
              className={cn(
                filters.schedule || filters.paymentMethodId || filters.users
                  ? "fill-primary text-primary"
                  : "`text-foreground",
              )}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="mr-3 flex w-fit flex-col gap-2 p-4">
          <Label>Schedule</Label>
          <Popover
            open={isOpen.schedule}
            onOpenChange={(open) => setIsOpen({ ...isOpen, schedule: open })}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-[200px] justify-between"
              >
                {filters.schedule ?? "Select..."}
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command shouldFilter={false}>
                <CommandInput placeholder="Search schedule..." />
                <CommandList>
                  <CommandEmpty>No schedule found.</CommandEmpty>
                  <CommandGroup>
                    {SCHEDULES.map((schedule) => (
                      <CommandItem
                        key={schedule}
                        value={schedule}
                        onSelect={(currentValue) => {
                          console.log(currentValue);
                          setFilters({
                            ...filters,
                            schedule:
                              filters.schedule === schedule ? null : schedule,
                          });
                        }}
                      >
                        {schedule}
                        <Check
                          className={cn(
                            "ml-auto",
                            filters.schedule === schedule
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

          <Label className="mt-2">Payment Method</Label>
          <Popover
            open={isOpen.paymentMethod}
            onOpenChange={(open) =>
              setIsOpen({ ...isOpen, paymentMethod: open })
            }
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-[200px] justify-between"
              >
                {filters.paymentMethodId
                  ? paymentMethods.find(
                      (paymentMethod) =>
                        paymentMethod.id === filters.paymentMethodId,
                    )?.name
                  : "Select..."}
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command shouldFilter={false}>
                <CommandInput placeholder="Search payment method..." />
                <CommandList>
                  <CommandEmpty>No payment method found.</CommandEmpty>
                  <CommandGroup>
                    {paymentMethods.map((paymentMethod) => (
                      <CommandItem
                        key={paymentMethod.id}
                        value={paymentMethod.id.toString()}
                        onSelect={(currentValue) => {
                          console.log(currentValue);

                          setFilters({
                            ...filters,
                            paymentMethodId:
                              filters.paymentMethodId === paymentMethod.id
                                ? null
                                : paymentMethod.id,
                          });
                        }}
                      >
                        {paymentMethod.name}
                        <Check
                          className={cn(
                            "ml-auto",
                            filters.paymentMethodId === paymentMethod.id
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
        </PopoverContent>
      </Popover>
    </div>
  );
};
