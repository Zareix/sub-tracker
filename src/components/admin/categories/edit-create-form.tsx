import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api, type RouterOutputs } from "~/utils/api";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { iconNames } from "lucide-react/dynamic";
import { CategoryIcon } from "~/components/subscriptions/categories/icon";

const categoryCreateSchema = z.object({
  name: z.string(),
  icon: z.string(),
});

export const EditCreateForm = ({
  category,
  onFinished,
}: {
  category?: RouterOutputs["category"]["getAll"][number];
  onFinished?: () => void;
}) => {
  const apiUtils = api.useUtils();
  const createCategoryMutation = api.category.create.useMutation({
    onSuccess: () => {
      toast.success("Category created!");
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
      toast.success("Category edited!");
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Raphael" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Icon</FormLabel>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "min-w-[200px] justify-between",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value
                          ? iconNames.find((name) => name === field.value)
                          : "Select icon"}
                        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search icon..." />
                      <CommandList>
                        <CommandEmpty>No icon found.</CommandEmpty>
                        <CommandGroup>
                          {iconNames.map((name) => (
                            <CommandItem
                              value={name}
                              key={name}
                              onSelect={() => {
                                form.setValue("icon", name);
                              }}
                            >
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
                {field.value && <CategoryIcon icon={field.value} />}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="ml-auto">
          Submit
        </Button>
      </form>
    </Form>
  );
};
