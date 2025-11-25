"use client";

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
	const { setTheme, theme } = useTheme();
	return (
		<section>
			<h2 className="mb-4 font-bold text-2xl">Appearance</h2>
			<div>
				<Select
					value={theme}
					onValueChange={(value) => setTheme(value)}
					defaultValue={theme}
				>
					<SelectTrigger className="min-w-[170px] capitalize">
						<SelectValue placeholder="Select role" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="light">
							<div className="flex items-center gap-2">
								<ThemeIcon theme="light" />
								Light
							</div>
						</SelectItem>
						<SelectItem value="dark">
							<div className="flex items-center gap-2">
								<ThemeIcon theme="dark" />
								Dark
							</div>
						</SelectItem>
						<SelectItem value="system">
							<div className="flex items-center gap-2">
								<ThemeIcon theme="system" />
								System
							</div>
						</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</section>
	);
};
