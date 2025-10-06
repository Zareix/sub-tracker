import Head from "next/head";
import { useQueryState } from "nuqs";
import { LoginForm } from "~/components/login";
import { AppSidebar, Navbar } from "~/components/nav";
import { PushNotificationHandler } from "~/components/push-notification";
import ResetPassword from "~/components/reset-password";
import { SidebarProvider } from "~/components/ui/sidebar";
import { authClient } from "~/lib/auth-client";

export const Layout = ({ children }: { children: React.ReactNode }) => {
	const session = authClient.useSession();
	const [token] = useQueryState("token");

	if (session.isPending) return null;

	if (token) {
		return (
			<>
				<Head>
					<title>Sub Tracker - Reset password</title>
					<meta name="description" content="Track your subscriptions" />
				</Head>
				<main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
					<div className="flex w-full max-w-sm flex-col gap-6">
						<ResetPassword token={token} />
					</div>
				</main>
			</>
		);
	}

	if (!session.data) {
		return (
			<>
				<Head>
					<title>Sub Tracker - Login</title>
					<meta name="description" content="Track your subscriptions" />
				</Head>
				<main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
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
					className="container relative mx-auto min-h-screen bg-background px-4 pt-8 pb-20 xl:max-w-5xl"
					data-vaul-drawer-wrapper
				>
					{children}
				</main>
				<Navbar />
				<PushNotificationHandler />
			</SidebarProvider>
		</>
	);
};
