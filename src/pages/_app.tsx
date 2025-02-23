import { GeistSans } from "geist/font/sans";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { NuqsAdapter } from "nuqs/adapters/next/pages";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { Layout } from "~/components/layout";
import { Toaster } from "~/components/ui/sonner";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
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
          <div className={GeistSans.className}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </div>
          <Toaster />
        </NuqsAdapter>
      </SessionProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
