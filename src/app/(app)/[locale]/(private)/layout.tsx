import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { LocaleHandler } from "~/components/locale";
import { AppSidebar, Navbar } from "~/components/nav";
import { SidebarProvider } from "~/components/ui/sidebar";
import { redirect } from "~/i18n/navigation";
import { getAuthSession } from "~/server/auth";

export const metadata: Metadata = {
	title: "Subtracker - Dashboard",
	description: "Track your subscriptions",
};

const PrivateLayout = async ({ children }: { children: React.ReactNode }) => {
	const session = await getAuthSession();

	if (!session) {
		redirect({ href: "/login", locale: await getLocale() });
	}

	return (
		<>
			<SidebarProvider>
				<AppSidebar />
				<main
					className="container relative mx-auto min-h-screen bg-background px-4 pt-8 pb-20 xl:max-w-5xl"
					data-vaul-drawer-wrapper
				>
					{children}
				</main>
				<Navbar />
			</SidebarProvider>
			<LocaleHandler />
		</>
	);
};

export default PrivateLayout;
