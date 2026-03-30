import { getLocale } from "next-intl/server";
import { ResetPasswordForm } from "~/components/auth/reset-password";
import { redirect } from "~/i18n/navigation";

const ResetPasswordPage = async ({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
	const token = (await searchParams).token;

	if (!token || typeof token !== "string") {
		return redirect({ href: "/login", locale: await getLocale() });
	}

	return <ResetPasswordForm token={token} />;
};

export default ResetPasswordPage;
