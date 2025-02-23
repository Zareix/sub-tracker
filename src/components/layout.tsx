export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <main className="container mx-auto grid min-h-screen px-4 pt-8 xl:max-w-5xl">
        {children}
      </main>
    </div>
  );
};
