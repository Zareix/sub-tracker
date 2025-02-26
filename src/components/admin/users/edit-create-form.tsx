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
import { ImageFileUploader } from "~/components/image-uploader";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

const userCreateSchema = z.object({
  image: z.string().optional(),
  name: z.string(),
  username: z.string(),
  password: z.string().optional(),
});

export const EditCreateForm = ({
  user,
  onFinished,
}: {
  user?: RouterOutputs["user"]["getAll"][number];
  onFinished?: () => void;
}) => {
  const session = useSession();
  const router = useRouter();
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
    onSuccess: (data) => {
      toast.success("User edited!");
      apiUtils.user.getAll.invalidate().catch(console.error);
      onFinished?.();
      setTimeout(() => {
        form.reset();
      }, 300);
      if (session.data?.user.id === data.id) {
        router.reload();
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm<z.infer<typeof userCreateSchema>>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      name: user?.name ?? "",
      username: user?.username ?? "",
      image: user?.image ?? undefined,
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
                  <Input placeholder="Raphael" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="raphael" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="***" type="password" {...field} />
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
