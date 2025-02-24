import Head from "next/head";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Head>
        <title>Sub Tracker</title>
        <meta name="description" content="Track your subscriptions" />
      </Head>
      <div>
        <main className="container mx-auto grid min-h-screen px-4 pt-8 xl:max-w-5xl">
          {children}
        </main>
      </div>
    </>
  );
};
