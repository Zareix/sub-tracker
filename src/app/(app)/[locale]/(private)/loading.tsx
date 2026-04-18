import { Calendar1Icon, InfoIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export const LoadingSkeleton = () => {
	return (
		<Card className="mt-3 border-none from-card opacity-50 shadow-none ring-transparent">
			<CardContent>
				<div className="flex items-center gap-2">
					<Skeleton className="h-10 w-14" />
					<div className="flex grow flex-col gap-1">
						<h2 className="font-semibold text-xl">
							<Skeleton className="h-6 w-20 md:w-28" />
						</h2>
						<div className="flex items-center gap-1 text-muted-foreground text-sm">
							<Calendar1Icon size={16} />
							<Skeleton className="h-4 w-16" />
						</div>
					</div>
					<div className="flex items-center text-lg">
						<Skeleton className="h-6 w-12" />€
					</div>
					<Button size="icon" variant="ghost" className="w-4 md:w-10" disabled>
						<InfoIcon size={20} />
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};

const LoadingFallback = () => {
	const t = useTranslations("HomePage");
	return (
		<>
			<header className="flex flex-wrap items-center justify-between gap-y-1">
				<h1 className="font-bold text-3xl">{t("title")}</h1>
			</header>
			<div className="mt-2 grid">
				<LoadingSkeleton />
			</div>
		</>
	);
};

export default LoadingFallback;
