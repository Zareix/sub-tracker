import { AppearanceSettings } from "~/components/profile/appearance";
import { CredentialsForm } from "~/components/profile/credentials";
import { UserInfoForm } from "~/components/profile/user-info";
import { Separator } from "~/components/ui/separator";
import { authClient } from "~/lib/auth-client";

export default function ProfilePage() {
	const session = authClient.useSession();
	const user = session.data?.user;

	if (!user) {
		return null;
	}

	return (
		<div className="grid w-full max-w-[100vw] items-start gap-4 lg:grid-cols-2 lg:gap-x-8">
			<header className="flex flex-wrap items-center justify-between lg:col-span-2">
				<h1 className="font-bold text-3xl">
					Welcome <span className="italic">{user.name}</span> !
				</h1>
			</header>

			<UserInfoForm user={user} />
			<Separator className="my-4 lg:hidden" />
			<CredentialsForm userId={user.id} />
			<AppearanceSettings />
		</div>
	);
}
