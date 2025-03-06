import { useSession } from "~/lib/auth-client";
import Head from "next/head";
import { LoginForm } from "~/components/login";
import { AppSidebar, Navbar } from "~/components/nav";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const session = useSession();

  if (session.isPending) return <></>;

  if (!session.data) {
    return (
      <>
        <Head>
          <title>Sub Tracker - Login</title>
          <meta name="description" content="Track your subscriptions" />
        </Head>
        <main className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
          <div className="flex w-full max-w-sm flex-col gap-6">
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
          className="bg-background relative container mx-auto min-h-screen px-4 pt-8 pb-20
            xl:max-w-5xl"
          data-vaul-drawer-wrapper
        >
          <SidebarTrigger className="absolute top-5 -left-7 hidden md:block" />
          {children}
        </main>
        <Navbar />
      </SidebarProvider>
    </>
  );
};
