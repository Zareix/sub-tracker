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
import { DialogFooter } from "~/components/ui/dialog";

const userCreateSchema = z.object({
  name: z.string(),
  email: z.string(),
});

export const EditCreateForm = ({
  user,
  onFinished,
}: {
  user?: RouterOutputs["user"]["getAll"][number];
  onFinished?: () => void;
}) => {
  const apiUtils = api.useUtils();
  const createUserMutation = api.user.create.useMutation({
    onSuccess: () => {
      toast.success("User created!");
      apiUtils.user.getAll.invalidate().catch(console.error);
      onFinished?.();
      setTimeout(() => {
        form.reset();
      }, 300);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const editUserMutation = api.user.edit.useMutation({
    onSuccess: () => {
      toast.success("User edited!");
      apiUtils.user.getAll.invalidate().catch(console.error);
      onFinished?.();
      setTimeout(() => {
        form.reset();
      }, 300);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm<z.infer<typeof userCreateSchema>>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
    },
  });

  function onSubmit(values: z.infer<typeof userCreateSchema>) {
    if (user) {
      editUserMutation.mutate({
        ...values,
        id: user.id,
      });
    } else {
      createUserMutation.mutate(values);
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="raphael@example.com" {...field} />
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
  );
};
