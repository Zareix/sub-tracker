import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Layout } from "~/components/layout";
import { Toaster } from "~/components/ui/sonner";
import { ThemeProvider } from "~/components/ui/theme-provider";
import { TRPCReactProvider } from "~/trpc/react";

import "~/styles/globals.css";

const geist = Geist({
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Subtracker",
	description: "Track your subscriptions",
	icons: {
		icon: "/favicon.ico",
	},
	robots: {
		index: false,
		follow: false,
	},
};

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "hsl(0 0% 100%)" },
		{ media: "(prefers-color-scheme: dark)", color: "hsl(222.2 84% 4.9%)" },
	],
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={geist.className}>
				<TRPCReactProvider>
					<NuqsAdapter>
						<ThemeProvider
							attribute="class"
							defaultTheme="system"
							enableSystem
							disableTransitionOnChange
						>
							<NextIntlClientProvider>
								<Layout>{children}</Layout>
								<Toaster
									toastOptions={{
										className:
											"bg-background/80 backdrop-blur-sm border-border text-foreground",
									}}
								/>
							</NextIntlClientProvider>
						</ThemeProvider>
					</NuqsAdapter>
				</TRPCReactProvider>
			</body>
		</html>
	);
}
