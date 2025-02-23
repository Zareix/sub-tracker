import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
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
import { api } from "~/utils/api";
import { toast } from "sonner";
import { useState } from "react";

const paymentMethodCreateSchema = z.object({
  name: z.string(),
});

export const CreatePaymentMethodDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const apiUtils = api.useUtils();
  const createPaymentMethodMutation = api.paymentMethod.create.useMutation({
    onSuccess: () => {
      toast.success("PaymentMethod created!");
      apiUtils.paymentMethod.getAll.invalidate().catch(console.error);
      setIsOpen(false);
      setTimeout(() => {
        form.reset();
      }, 300);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm<z.infer<typeof paymentMethodCreateSchema>>({
    resolver: zodResolver(paymentMethodCreateSchema),
    defaultValues: {
      name: "",
    },
  });

  function onSubmit(values: z.infer<typeof paymentMethodCreateSchema>) {
    createPaymentMethodMutation.mutate(values);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Create Payment Method</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Create Payment Method</DialogTitle>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="PayPal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="ml-auto">
              Submit
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
