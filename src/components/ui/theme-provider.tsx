"use client";
import { LaptopIcon, MoonIcon, SunIcon } from "lucide-react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import type * as React from "react";

export function ThemeProvider({
	children,
	...props
}: React.ComponentProps<typeof NextThemesProvider>) {
	return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export const ThemeIcon = ({ theme }: { theme?: string }) => {
	switch (theme) {
		case "light":
			return <SunIcon className="size-4" />;
		case "dark":
			return <MoonIcon className="size-4" />;
		default:
			return <LaptopIcon className="size-4" />;
	}
};

export const THEMES = ["light", "dark", "system"] as const;
