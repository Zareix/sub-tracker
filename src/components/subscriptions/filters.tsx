import { Button } from "~/components/ui/button";
import { ChevronsUpDown, FilterIcon, TrashIcon } from "lucide-react";
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
import { type Filters } from "~/lib/constant";
import { api } from "~/utils/api";
import { SCHEDULES } from "~/lib/constant";
import { Label } from "@radix-ui/react-label";
import { useFilters } from "~/lib/hooks/use-filters";

type Props = {
  filtersDisplayed?: Array<keyof Filters>;
};

export const FiltersButton = ({
  filtersDisplayed = ["paymentMethodId", "schedule", "users", "categoryId"],
}: Props) => {
  const [filters, setFilters] = useFilters();
  const [isOpen, setIsOpen] = useState({
    schedule: false,
    paymentMethod: false,
    users: false,
    category: false,
  });

  const usersQuery = api.user.getAll.useQuery();
  const paymentMethodsQuery = api.paymentMethod.getAll.useQuery();
  const categoriesQuery = api.category.getAll.useQuery();

  if (
    usersQuery.isError ||
    paymentMethodsQuery.isError ||
    categoriesQuery.isError
  ) {
    return <></>;
  }

  const paymentMethods = paymentMethodsQuery.data ?? [];
  const users = usersQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  return (
    <div className="flex items-center gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            disabled={
              usersQuery.isLoading ||
              paymentMethodsQuery.isLoading ||
              categoriesQuery.isLoading
            }
          >
            <FilterIcon
              size={24}
              className={cn(
                filters.schedule ||
                  filters.paymentMethodId ||
                  filters.users ||
                  filters.categoryId
                  ? "fill-primary text-primary"
                  : "`text-foreground",
              )}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="mr-3 flex w-fit flex-col gap-2 p-4">
          {filtersDisplayed.includes("users") && (
            <>
              <Label className="mt-2">Users</Label>
              <div className="flex items-center gap-2">
                <Popover
                  open={isOpen.users}
                  onOpenChange={(open) => setIsOpen({ ...isOpen, users: open })}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline-t"
                      role="combobox"
                      className={cn(
                        "justify-between from-transparent to-transparent",
                        filters.users ? "w-[150px]" : "w-[200px]",
                      )}
                    >
                      {filters.users
                        ? users.find((user) => user.id === filters.users)?.name
                        : "Select..."}
                      <ChevronsUpDown size={20} className="opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command shouldFilter={false}>
                      <CommandInput placeholder="Search users..." />
                      <CommandList>
                        <CommandEmpty>No users found.</CommandEmpty>
                        <CommandGroup>
                          {users.map((user) => (
                            <CommandItem
                              key={user.id}
                              value={user.id.toString()}
                              onSelect={(currentValue) => {
                                console.log(currentValue);

                                setFilters({
                                  ...filters,
                                  users:
                                    filters.users === user.id ? null : user.id,
                                }).catch(console.error);
                              }}
                            >
                              {user.name}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  filters.users === user.id
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
                {filters.users && (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => setFilters({ ...filters, users: null })}
                  >
                    <TrashIcon className="size-5" />
                  </Button>
                )}
              </div>
            </>
          )}

          {filtersDisplayed.includes("schedule") && (
            <>
              <Label>Schedule</Label>
              <div className="flex items-center gap-2">
                <Popover
                  open={isOpen.schedule}
                  onOpenChange={(open) =>
                    setIsOpen({ ...isOpen, schedule: open })
                  }
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline-t"
                      role="combobox"
                      className={cn(
                        "justify-between from-transparent to-transparent",
                        filters.schedule ? "w-[150px]" : "w-[200px]",
                      )}
                    >
                      {filters.schedule ?? "Select..."}
                      <ChevronsUpDown size={20} className="opacity-50" />
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
                                    filters.schedule === schedule
                                      ? null
                                      : schedule,
                                }).catch(console.error);
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
                {filters.schedule && (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => setFilters({ ...filters, schedule: null })}
                  >
                    <TrashIcon className="size-5" />
                  </Button>
                )}
              </div>
            </>
          )}

          {filtersDisplayed.includes("paymentMethodId") && (
            <>
              <Label className="mt-2">Payment Method</Label>
              <div className="flex items-center gap-2">
                <Popover
                  open={isOpen.paymentMethod}
                  onOpenChange={(open) =>
                    setIsOpen({ ...isOpen, paymentMethod: open })
                  }
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline-t"
                      role="combobox"
                      className={cn(
                        "justify-between from-transparent to-transparent",
                        filters.paymentMethodId ? "w-[150px]" : "w-[200px]",
                      )}
                    >
                      {filters.paymentMethodId
                        ? paymentMethods.find(
                            (paymentMethod) =>
                              paymentMethod.id === filters.paymentMethodId,
                          )?.name
                        : "Select..."}
                      <ChevronsUpDown size={20} className="opacity-50" />
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
                                }).catch(console.error);
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
                {filters.paymentMethodId && (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() =>
                      setFilters({ ...filters, paymentMethodId: null })
                    }
                  >
                    <TrashIcon className="size-5" />
                  </Button>
                )}
              </div>
            </>
          )}

          {filtersDisplayed.includes("categoryId") && (
            <>
              <Label className="mt-2">Category</Label>
              <div className="flex items-center gap-2">
                <Popover
                  open={isOpen.category}
                  onOpenChange={(open) =>
                    setIsOpen({ ...isOpen, category: open })
                  }
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline-t"
                      role="combobox"
                      className={cn(
                        "justify-between from-transparent to-transparent",
                        filters.categoryId ? "w-[150px]" : "w-[200px]",
                      )}
                    >
                      {filters.categoryId
                        ? categories.find(
                            (category) => category.id === filters.categoryId,
                          )?.name
                        : "Select..."}
                      <ChevronsUpDown size={20} className="opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command shouldFilter={false}>
                      <CommandInput placeholder="Search payment method..." />
                      <CommandList>
                        <CommandEmpty>No payment method found.</CommandEmpty>
                        <CommandGroup>
                          {categories.map((category) => (
                            <CommandItem
                              key={category.id}
                              value={category.id.toString()}
                              onSelect={(currentValue) => {
                                console.log(currentValue);
                                setFilters({
                                  ...filters,
                                  categoryId:
                                    filters.categoryId === category.id
                                      ? null
                                      : category.id,
                                }).catch(console.error);
                              }}
                            >
                              {category.name}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  filters.categoryId === category.id
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
                {filters.categoryId && (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => setFilters({ ...filters, categoryId: null })}
                  >
                    <TrashIcon className="size-5" />
                  </Button>
                )}
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};
