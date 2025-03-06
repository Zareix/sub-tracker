import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CalendarSyncIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
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
import { Separator } from "~/components/ui/separator";
import { signIn } from "~/lib/auth-client";

const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export const LoginForm = () => {
  const router = useRouter();
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
  const signInPassKeyMutation = useMutation({
    mutationFn: async () => {
      return signIn.passkey();
    },
    onSuccess: () => {
      router.reload();
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

  useEffect(() => {
    if (typeof PublicKeyCredential === "undefined") {
      return;
    }
    PublicKeyCredential.isConditionalMediationAvailable()
      .then((available) => {
        if (available) {
          void signIn.passkey({ autoFill: true });
        }
      })
      .catch(console.error);
  }, []);

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
            className="bg-primary text-primary-foreground flex size-9 items-center justify-center
              rounded-xs"
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
                      <Input
                        placeholder="raphael@example.com"
                        autoComplete="email webauthn"
                        {...field}
                      />
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
                        autoComplete="current-password webauthn"
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
        <Separator className="my-4 w-full" />
        <Button
          onClick={() => {
            signInPassKeyMutation.mutate();
          }}
          variant="outline"
          className="w-full"
        >
          Login with passkey
        </Button>
      </CardContent>
    </Card>
  );
};
