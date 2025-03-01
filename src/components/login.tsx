import { CalendarSyncIcon } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export const LoginForm = () => {
  const handleLogin = () => {
    signIn("google", {
      redirect: false,
    })
      .then((data) => {
        console.log(data);
        if (data && "error" in data && data.error) {
          throw new Error(data.error);
        }
        return data;
      })
      .catch((error) => {
        console.log(error);
        toast.error("Error logging in");
      });
  };

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
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>Login with your Google account</CardDescription>
      </CardHeader>
      <CardContent className="mt-4">
        <Button variant="outline" className="w-full" onClick={handleLogin}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="size-6"
          >
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="currentColor"
            />
          </svg>
          Login with Google
        </Button>
      </CardContent>
    </Card>
  );
};
