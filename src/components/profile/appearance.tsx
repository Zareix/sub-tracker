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
import { THEMES, ThemeIcon } from "~/components/ui/theme-provider";

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
					onValueChange={(value) => setTheme(value ?? "system")}
					items={THEMES.map((theme) => ({
						value: theme,
						label: tNav(`theme.${theme}`),
					}))}
				>
					<SelectTrigger className="min-w-42.5 capitalize">
						<SelectValue placeholder={tNav("theme.label")} />
					</SelectTrigger>
					<SelectContent>
						{THEMES.map((t) => (
							<SelectItem key={t} value={t}>
								<div className="flex items-center gap-2">
									<ThemeIcon theme={t} />
									{tNav(`theme.${t}`)}
								</div>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</section>
	);
};
