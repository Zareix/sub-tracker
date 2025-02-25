import { GeistSans } from "geist/font/sans";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { NuqsAdapter } from "nuqs/adapters/next/pages";
import { api } from "~/utils/api";
import { Layout } from "~/components/layout";
import { Toaster } from "~/components/ui/sonner";
import { TooltipProvider } from "~/components/ui/tooltip";
import { useEffect } from "react";
import { scan } from "react-scan";
import { env } from "~/env";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "~/styles/globals.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  useEffect(() => {
    if (env.NEXT_PUBLIC_ENV === "development") {
      scan({
        enabled: true,
      });
    }
  }, []);
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
      <SessionProvider session={session}>
        <NuqsAdapter>
          <TooltipProvider>
            <div className={GeistSans.className}>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </div>
            <Toaster />
            {env.NEXT_PUBLIC_ENV === "development" && <ReactQueryDevtools />}
          </TooltipProvider>
        </NuqsAdapter>
      </SessionProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
