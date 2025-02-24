import Head from "next/head";
import { AppSidebar } from "~/components/ui/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Head>
        <title>Sub Tracker</title>
        <meta name="description" content="Track your subscriptions" />
      </Head>
      <SidebarProvider>
        <AppSidebar />
        <main className="container mx-auto min-h-screen px-4 pt-8 xl:max-w-5xl">
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </>
  );
};
