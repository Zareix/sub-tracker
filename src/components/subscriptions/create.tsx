import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Drawer } from "vaul";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "~/utils/api";
import { toast } from "sonner";
import { use, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { MultiSelect } from "~/components/ui/multi-select";
import { SCHEDULES } from "~/lib/constant";
import { preprocessStringToNumber } from "~/lib/utils";
import { PlusIcon } from "lucide-react";
import { useWindowSize } from "~/lib/hook";
import { WrapperDialogVaul } from "~/components/ui/vaul-dialog";

const subscriptionCreateSchema = z.object({
  name: z.string(),
  price: z.preprocess(preprocessStringToNumber, z.number().min(0)),
  paymentMethod: z.string(),
  schedule: z.enum(SCHEDULES),
  payedBy: z.array(z.string()),
});

export const CreateSubscriptionDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const apiUtils = api.useUtils();
  const createSubscriptionMutation = api.subscription.create.useMutation({
    onSuccess: () => {
      toast.success("Subscription created!");
      apiUtils.subscription.getAll.invalidate().catch(console.error);
      setIsOpen(false);
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
      name: "",
      price: 0,
      paymentMethod: "",
      schedule: "Monthly",
      payedBy: [],
    },
  });

  function onSubmit(values: z.infer<typeof subscriptionCreateSchema>) {
    createSubscriptionMutation.mutate(values);
  }

  return (
    <WrapperDialogVaul
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      trigger={
        <Button size="icon" className="size-10 rounded-full shadow-md">
          <PlusIcon size={34} />
        </Button>
      }
    >
      <DialogTitle>Create Subscription</DialogTitle>
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
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Netflix" {...field} />
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
                      defaultValue={field.value}
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
    </WrapperDialogVaul>
  );
};
