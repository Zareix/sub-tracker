import Head from "next/head";
import { AppSidebar, Navbar } from "~/components/nav";
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
        <main
          className="container mx-auto min-h-screen bg-background px-4 pt-8 xl:max-w-5xl"
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
