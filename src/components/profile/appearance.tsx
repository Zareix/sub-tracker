"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { ThemeIcon } from "~/components/ui/theme-provider";

export const AppearanceSettings = () => {
	const t = useTranslations("ProfilePage");
	const tNav = useTranslations("Navigation");
	const { setTheme, theme } = useTheme();
	return (
		<section>
			<h2 className="mb-4 font-bold text-2xl">{t("appearance")}</h2>
			<div>
				<Select
					value={theme}
					onValueChange={(value) => setTheme(value)}
					defaultValue={theme}
				>
					<SelectTrigger className="min-w-[170px] capitalize">
						<SelectValue placeholder={tNav("theme.label")} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="light">
							<div className="flex items-center gap-2">
								<ThemeIcon theme="light" />
								{tNav("theme.light")}
							</div>
						</SelectItem>
						<SelectItem value="dark">
							<div className="flex items-center gap-2">
								<ThemeIcon theme="dark" />
								{tNav("theme.dark")}
							</div>
						</SelectItem>
						<SelectItem value="system">
							<div className="flex items-center gap-2">
								<ThemeIcon theme="system" />
								{tNav("theme.system")}
							</div>
						</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</section>
	);
};
