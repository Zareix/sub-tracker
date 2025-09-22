import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { authClient } from "~/lib/auth-client";
import { CURRENCY_SYMBOLS, Currencies, type Currency } from "~/lib/constant";
import { api } from "~/utils/api";

export const CurrencySettings = () => {
	const { data: session, isPending: isSessionLoading } =
		authClient.useSession();
	const user = session?.user;
	const apiUtils = api.useUtils();
	const updateBaseCurrencyMutation = useMutation({
		mutationFn: (newCurrency: string) =>
			authClient.updateUser({
				baseCurrency: newCurrency as Currency,
			}),
		onSuccess: (res) => {
			if (res.error) {
				toast.error(res.error.message);
				return;
			}
			toast.success("Currency updated successfully!");
			apiUtils.subscription.getAll.invalidate();
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to update currency",
			);
		},
	});

	if (isSessionLoading || !user) {
		return (
			<section>
				<h2 className="mb-4 font-bold text-2xl">Currency Settings</h2>
				<div className="animate-pulse">
					<div className="mb-2 h-4 w-32 rounded bg-gray-200" />
					<div className="h-10 w-full rounded bg-gray-200" />
				</div>
			</section>
		);
	}

	return (
		<section>
			<h2 className="mb-4 font-bold text-2xl">Currency Settings</h2>
			<Select
				value={user.baseCurrency}
				onValueChange={(value) => {
					updateBaseCurrencyMutation.mutate(value as Currency);
				}}
			>
				<SelectTrigger className="min-w-[170px] capitalize">
					<SelectValue placeholder="Select a currency" />
				</SelectTrigger>
				<SelectContent>
					{Currencies.map((currency) => (
						<SelectItem key={currency} value={currency}>
							{CURRENCY_SYMBOLS[currency]} {currency}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</section>
	);
};
