import { getLocale } from "next-intl/server";
import { redirect } from "~/i18n/navigation";
import { getAuthSession } from "~/server/auth";

const PublicLayout = async ({ children }: { children: React.ReactNode }) => {
	const session = await getAuthSession();

	if (session) {
		redirect({ href: "/", locale: await getLocale() });
	}

	return (
		<main className="flex min-h-svh w-full flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
			{children}
		</main>
	);
};

export default PublicLayout;
