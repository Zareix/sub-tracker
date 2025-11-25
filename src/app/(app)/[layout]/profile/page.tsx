import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AppearanceSettings } from "~/components/profile/appearance";
import { CredentialsForm } from "~/components/profile/credentials";
import { CurrencySettings } from "~/components/profile/currency-settings";
import { UserInfoForm } from "~/components/profile/user-info";
import { Separator } from "~/components/ui/separator";
import { getAuthSession } from "~/server/auth";

export default async function ProfilePage() {
	const session = await getAuthSession();
	const t = await getTranslations("ProfilePage");
	if (!session) {
		redirect("/");
	}

	return (
		<div className="grid w-full max-w-[100vw] items-start gap-4 lg:grid-cols-2 lg:gap-x-8">
			<header className="flex flex-wrap items-center justify-between lg:col-span-2">
				<h1 className="font-bold text-3xl">
					{t("welcome", { name: session.user.name })}
				</h1>
			</header>

			<div className="grid gap-4">
				<UserInfoForm user={session.user} />
				<CurrencySettings />
				<AppearanceSettings />
			</div>
			<Separator className="my-4 lg:hidden" />
			<CredentialsForm userId={session.user.id} />
		</div>
	);
}
