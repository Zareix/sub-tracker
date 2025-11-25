import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import type messages from "./messages/en.json";
import { routing } from "./routing";

declare module "next-intl" {
	interface AppConfig {
		Locale: (typeof routing.locales)[number];
		Messages: typeof messages;
	}
}

export default getRequestConfig(async ({ requestLocale }) => {
	const requested = await requestLocale;
	const locale = hasLocale(routing.locales, requested)
		? requested
		: routing.defaultLocale;

	return {
		locale,
		messages: (await import(`./messages/${locale}.json`)).default,
	};
});
