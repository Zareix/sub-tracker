import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CalendarSyncIcon } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { signIn } from "~/lib/auth-client";

const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export const LoginForm = () => {
  const signInMutation = useMutation({
    mutationFn: async (values: z.infer<typeof loginSchema>) => {
      return signIn.email({
        email: values.email,
        password: values.password,
      });
    },
    onError: () => {
      toast.error("Could not login, please try again.");
    },
  });
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof loginSchema>) {
    signInMutation.mutate(values);
  }

  return (
    <Card>
      <CardHeader>
        <Link
          href="#"
          className="flex items-center gap-2 self-center py-4 text-xl font-medium"
        >
          <div
            className="flex h-9 w-9 items-center justify-center rounded-md bg-primary
              text-primary-foreground"
          >
            <CalendarSyncIcon className="size-[22px]" />
          </div>
          Subtracker
        </Link>
        <CardTitle className="text-2xl">Login</CardTitle>
      </CardHeader>
      <CardContent className="mt-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="raphael@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
