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
import { api, type RouterOutputs } from "~/utils/api";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { MultiSelect } from "~/components/ui/multi-select";
import { type Schedule, SCHEDULES } from "~/lib/constant";
import { preprocessStringToNumber } from "~/lib/utils";
import { ImageFileUploader } from "~/components/subscriptions/image-uploader";

const subscriptionCreateSchema = z.object({
  name: z.string(),
  description: z.string(),
  image: z.string().optional(),
  price: z.preprocess(preprocessStringToNumber, z.number().min(0)),
  paymentMethod: z.preprocess(preprocessStringToNumber, z.number()),
  schedule: z.enum(SCHEDULES),
  payedBy: z.array(z.string()),
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
      apiUtils.subscription.getAll.invalidate().catch(console.error);
      onFinished?.();
      setTimeout(() => {
        form.reset();
      }, 300);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const editSubscriptionMutation = api.subscription.edit.useMutation({
    onSuccess: () => {
      toast.success("Subscription updated!");
      apiUtils.subscription.getAll.invalidate().catch(console.error);
      onFinished?.();
      setTimeout(() => {
        form.reset();
      }, 300);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const usersQuery = api.user.getAll.useQuery();
  const paymentMethodsQuery = api.paymentMethod.getAll.useQuery();

  const form = useForm<z.infer<typeof subscriptionCreateSchema>>({
    resolver: zodResolver(subscriptionCreateSchema),
    defaultValues: {
      name: subscription?.name ?? "",
      description: subscription?.description ?? "",
      price: subscription?.price ?? 0,
      paymentMethod: subscription?.paymentMethod.id,
      schedule: (subscription?.schedule as Schedule) ?? "Monthly",
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
      {usersQuery.isLoading || paymentMethodsQuery.isLoading ? (
        <div>Loading...</div>
      ) : usersQuery.isError || paymentMethodsQuery.isError ? (
        <div>
          Error:{" "}
          {usersQuery.error?.message ?? paymentMethodsQuery.error?.message}
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid grid-cols-12">
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
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input placeholder="10" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="payedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payed By</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={
                        usersQuery.data?.map((user) => ({
                          label: user.name,
                          value: user.id.toString(),
                        })) ?? []
                      }
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      placeholder="Select users"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
                        <SelectTrigger>
                          <SelectValue placeholder="Select a payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentMethodsQuery.data?.map((p) => (
                          <SelectItem value={p.id.toString()} key={p.id}>
                            {p.name}
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
              name="schedule"
              render={({ field }) => (
                <FormItem>
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
            <DialogFooter>
              <Button type="submit">Submit</Button>
            </DialogFooter>
          </form>
        </Form>
      )}
    </>
  );
};
