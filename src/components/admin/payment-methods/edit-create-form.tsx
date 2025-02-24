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
import { ImageFileUploader } from "~/components/image-uploader";

const paymentMethodCreateSchema = z.object({
  name: z.string(),
  image: z.string().optional(),
});

export const EditCreateForm = ({
  paymentMethod,
  onFinished,
}: {
  paymentMethod?: RouterOutputs["paymentMethod"]["getAll"][number];
  onFinished?: () => void;
}) => {
  const apiUtils = api.useUtils();
  const createPaymentMethodMutation = api.paymentMethod.create.useMutation({
    onSuccess: () => {
      toast.success("PaymentMethod created!");
      apiUtils.paymentMethod.getAll.invalidate().catch(console.error);
      onFinished?.();
      setTimeout(() => {
        form.reset();
      }, 300);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const editPaymentMethodMutation = api.paymentMethod.edit.useMutation({
    onSuccess: () => {
      toast.success("PaymentMethod edited!");
      apiUtils.paymentMethod.getAll.invalidate().catch(console.error);
      onFinished?.();
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
      name: paymentMethod?.name ?? "",
      image: paymentMethod?.image ?? undefined,
    },
  });

  function onSubmit(values: z.infer<typeof paymentMethodCreateSchema>) {
    if (paymentMethod) {
      editPaymentMethodMutation.mutate({
        ...values,
        id: paymentMethod.id,
      });
    } else {
      createPaymentMethodMutation.mutate(values);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-8">
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
                  <Input placeholder="PayPal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter>
          <Button type="submit">Submit</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
