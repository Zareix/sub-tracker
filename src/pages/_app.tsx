import { GeistSans } from "geist/font/sans";
import type { AppType } from "next/app";
import { NuqsAdapter } from "nuqs/adapters/next/pages";
import { Layout } from "~/components/layout";
import { Toaster } from "~/components/ui/sonner";
import { TooltipProvider } from "~/components/ui/tooltip";
import { api } from "~/utils/api";
// import { useEffect } from "react";
// import { scan } from "react-scan";
// import { env } from "~/env";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import PushNotification from "~/components/push-notification";
import { ThemeProvider } from "~/components/ui/theme-provider";
import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
	// useEffect(() => {
	//   if (env.NEXT_PUBLIC_ENV === "development") {
	//     scan({
	//       enabled: true,
	//     });
	//   }
	// }, []);

	return (
		<>
			<style jsx global>{`
        :root {
          --font-sans: ${GeistSans.variable};
        }
        html {
          font-family: ${GeistSans.style.fontFamily};
        }
      `}</style>
			<NuqsAdapter>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<TooltipProvider>
						<div className={GeistSans.className}>
							<Layout>
								<Component {...pageProps} />
							</Layout>
						</div>
						<Toaster />
						{/* {env.NEXT_PUBLIC_ENV === "development" && <ReactQueryDevtools />} */}
					</TooltipProvider>
					<PushNotification />
				</ThemeProvider>
			</NuqsAdapter>
		</>
	);
};

export default api.withTRPC(MyApp);
