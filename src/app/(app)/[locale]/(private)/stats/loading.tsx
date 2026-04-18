import { useTranslations } from "next-intl";
import { Loading } from "~/components/loading";

const LoadingFallback = () => {
	const t = useTranslations("StatsPage");
	return (
		<>
			<header className="flex flex-wrap items-center justify-between gap-y-1">
				<h1 className="font-bold text-3xl">{t("title")}</h1>
			</header>
			<div className="mt-2 grid">
				<Loading size="lg" />
			</div>
		</>
	);
};

export default LoadingFallback;
