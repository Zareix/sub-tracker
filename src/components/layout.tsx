import { CalendarSyncIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { LoginForm } from "~/components/login";
import { AppSidebar, Navbar } from "~/components/nav";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const session = useSession();

  if (session.status === "loading") return <></>;

  if (session.status === "unauthenticated") {
    return (
      <>
        <Head>
          <title>Sub Tracker - Login</title>
          <meta name="description" content="Track your subscriptions" />
        </Head>
        <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
          <div className="flex w-full max-w-sm flex-col gap-6">
            <Link
              href="#"
              className="flex items-center gap-2 self-center text-lg font-medium"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-md bg-primary
                  text-primary-foreground"
              >
                <CalendarSyncIcon className="size-5" />
              </div>
              Subtracker
            </Link>
            <LoginForm />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Sub Tracker</title>
        <meta name="description" content="Track your subscriptions" />
      </Head>
      <SidebarProvider>
        <AppSidebar />
        <main
          className="container mx-auto min-h-screen bg-background px-4 pb-20 pt-8 xl:max-w-5xl"
          data-vaul-drawer-wrapper
        >
          <SidebarTrigger className="hidden md:block" />
          {children}
        </main>
        <Navbar />
      </SidebarProvider>
    </>
  );
};
