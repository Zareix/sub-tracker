import { setDefaultOptions } from "date-fns";
import { useEffect } from "react";

const formatRelativeLocale = {
	fr: {
		lastWeek: "eeee 'dernier'",
		yesterday: "'Hier'",
		today: "'Aujourd''hui'",
		tomorrow: "'Demain'",
		nextWeek: "eeee 'prochain'",
		other: "dd/MM/yyyy",
	},
	"en-US": {
		lastWeek: "'Last' eeee",
		yesterday: "'Yesterday'",
		today: "'Today'",
		tomorrow: "'Tomorrow'",
		nextWeek: "'Next' eeee",
		other: "dd/MM/yyyy",
	},
};

export const LocaleHandler = () => {
	useEffect(() => {
		if (typeof navigator !== "undefined" && navigator.language) {
			switch (navigator.language) {
				case "fr":
					import("date-fns/locale/fr").then((module) => {
						setDefaultOptions({
							locale: {
								...module.fr,
								formatRelative: (token) => formatRelativeLocale.fr[token],
							},
						});
					});
					break;
				default:
					import("date-fns/locale/en-US").then((module) => {
						setDefaultOptions({
							locale: {
								...module.enUS,
								formatRelative: (token) => formatRelativeLocale["en-US"][token],
							},
						});
					});
					break;
			}
		}
	}, []);

	return null;
};
