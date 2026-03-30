import { getLocale, getTranslations } from "next-intl/server";
import { AppearanceSettings } from "~/components/profile/appearance";
import { CredentialsForm } from "~/components/profile/credentials";
import { CurrencySettings } from "~/components/profile/currency-settings";
import { UserInfoForm } from "~/components/profile/user-info";
import { Separator } from "~/components/ui/separator";
import { redirect } from "~/i18n/navigation";
import { getAuthSession } from "~/server/auth";

export default async function ProfilePage() {
	const t = await getTranslations("ProfilePage");
	const session = await getAuthSession();
	if (!session) {
		return redirect({ href: "/", locale: await getLocale() });
	}

	return (
		<div className="grid w-full max-w-lg items-start gap-6">
			<header className="flex flex-wrap items-center justify-between">
				<h1 className="font-bold text-3xl">
					{t("welcome", { name: session.user.name })}
				</h1>
			</header>

			<UserInfoForm user={session.user} />
			<CurrencySettings />
			<AppearanceSettings />
			<Separator className="my-4 lg:hidden" />
			<CredentialsForm userId={session.user.id} />
		</div>
	);
}
