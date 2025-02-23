import { CreateSubscriptionDialog } from "~/components/subscriptions/create";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <main className="container mx-auto grid min-h-screen px-4 pt-8 xl:max-w-5xl">
        {children}
      </main>
      <div className="bg-background/80 fixed bottom-6 left-auto right-2 flex items-center justify-center gap-4 p-4">
        <CreateSubscriptionDialog />
      </div>
    </div>
  );
};
