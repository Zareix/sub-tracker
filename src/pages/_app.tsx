import { GeistSans } from "geist/font/sans";
import { type AppType } from "next/app";
import { NuqsAdapter } from "nuqs/adapters/next/pages";
import { api } from "~/utils/api";
import { Layout } from "~/components/layout";
import { Toaster } from "~/components/ui/sonner";
import { TooltipProvider } from "~/components/ui/tooltip";
// import { useEffect } from "react";
// import { scan } from "react-scan";
// import { env } from "~/env";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

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
        <TooltipProvider>
          <div className={GeistSans.className}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </div>
          <Toaster />
          {/* {env.NEXT_PUBLIC_ENV === "development" && <ReactQueryDevtools />} */}
        </TooltipProvider>
      </NuqsAdapter>
    </>
  );
};

export default api.withTRPC(MyApp);
