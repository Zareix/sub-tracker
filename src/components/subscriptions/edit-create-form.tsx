import { useForm } from "react-hook-form";
import { z } from "zod";
import { DialogFooter } from "~/components/ui/dialog";
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
import { api, type RouterInputs, type RouterOutputs } from "~/utils/api";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { MultiSelect } from "~/components/ui/multi-select";
import { CURRENCIES, SCHEDULES } from "~/lib/constant";
import { cn, preprocessStringToNumber } from "~/lib/utils";
import { ImageFileUploader } from "~/components/image-uploader";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "~/components/ui/calendar";
import { Separator } from "~/components/ui/separator";
import Image from "next/image";
import { CategoryIcon } from "~/components/subscriptions/categories/icon";

const createTempSub = (subscription: RouterInputs["subscription"]["create"]) =>
  ({
    ...subscription,
    id: -1,
    createdAt: new Date(),
    updatedAt: new Date(),
    originalPrice: subscription.price,
    nextPaymentDate: new Date(),
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
  }) satisfies RouterOutputs["subscription"]["getAll"][number];

const subscriptionCreateSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.preprocess(preprocessStringToNumber, z.number()),
  image: z.string().optional(),
  price: z.preprocess(preprocessStringToNumber, z.number().min(0)),
  currency: z.enum(CURRENCIES),
  paymentMethod: z.preprocess(preprocessStringToNumber, z.number()),
  firstPaymentDate: z.date(),
  schedule: z.enum(SCHEDULES),
  payedBy: z.array(z.string()).min(1),
});

export const EditCreateForm = ({
  subscription,
  onFinished,
}: {
  subscription?: RouterOutputs["subscription"]["getAll"][number];
  onFinished?: () => void;
}) => {
  const apiUtils = api.useUtils();
  const createSubscriptionMutation = api.subscription.create.useMutation({
    onSuccess: () => {
      toast.success("Subscription created!");
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
      toast.success("Subscription updated!");
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
      currency: subscription?.currency ?? "EUR",
      paymentMethod: subscription?.paymentMethod.id,
      schedule: subscription?.schedule ?? "Monthly",
      firstPaymentDate: subscription?.firstPaymentDate,
      payedBy: subscription?.users.map((u) => u.id) ?? [],
    },
  });

  function onSubmit(values: z.infer<typeof subscriptionCreateSchema>) {
    if (subscription) {
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
        <div>Loading...</div>
      ) : usersQuery.isError ||
        paymentMethodsQuery.isError ||
        categoriesQuery.isError ? (
        <div>
          Error:{" "}
          {usersQuery.error?.message ?? paymentMethodsQuery.error?.message}
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid grid-cols-12 gap-2">
              <ImageFileUploader
                setFileUrl={(v) => form.setValue("image", v)}
                fileUrl={form.watch("image")}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-10">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Netflix" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="min-w-[170px]">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoriesQuery.data?.map((p) => (
                          <SelectItem value={p.id.toString()} key={p.id}>
                            <div className="flex items-center gap-1">
                              {p.icon && (
                                <CategoryIcon
                                  icon={p.icon}
                                  className="max-h-[20px] max-w-[20px] object-contain"
                                />
                              )}
                              {p.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Something about the subscription"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="grow">
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="10"
                        type="number"
                        className="rounded-r-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-l-none border-l-0">
                            <SelectValue placeholder="Select a currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CURRENCIES.map((s) => (
                            <SelectItem value={s} key={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Separator
                orientation="vertical"
                className="mx-2 my-auto flex h-12"
              />
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger className="min-w-[170px]">
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
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
                                    className="max-h-[20px] max-w-[20px] object-contain"
                                  />
                                )}
                                {p.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="payedBy"
              render={({ field }) => (
                <FormItem className="grow">
                  <FormLabel>Payed By</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={
                        usersQuery.data?.map((user) => ({
                          label: user.name,
                          value: user.id.toString(),
                        })) ?? []
                      }
                      search={false}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      placeholder="Select users"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="schedule"
                render={({ field }) => (
                  <FormItem className="min-w-40">
                    <FormLabel>Schedule</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a schedule" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SCHEDULES.map((s) => (
                            <SelectItem value={s} key={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstPaymentDate"
                render={({ field }) => (
                  <FormItem className="grow">
                    <FormLabel>First Payment Date</FormLabel>
                    <FormControl>
                      <Popover modal>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline-t"
                            className={cn(
                              "h-10 w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 size-4" />
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="pointer-events-auto w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
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
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      )}
    </>
  );
};
