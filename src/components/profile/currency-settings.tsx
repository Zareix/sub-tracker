import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4-mini";
import { Button } from "~/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { CURRENCIES, CURRENCY_SYMBOLS } from "~/lib/constant";
import { api } from "~/utils/api";

const currencySettingsSchema = z.object({
	baseCurrency: z.enum(CURRENCIES),
});

export const CurrencySettings = () => {
	const apiUtils = api.useUtils();
	const { data: userProfile, isLoading } = api.user.getProfile.useQuery();
	const updateBaseCurrencyMutation = api.user.updateBaseCurrency.useMutation({
		onSuccess: () => {
			toast.success("Currency updated successfully!");
			apiUtils.user.getProfile.invalidate().catch(console.error);
			apiUtils.subscription.getAll.invalidate().catch(console.error);
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update currency");
		},
	});

	const form = useForm({
		resolver: zodResolver(currencySettingsSchema),
		defaultValues: {
			baseCurrency: userProfile?.baseCurrency ?? "EUR",
		},
	});

	// Update form when user profile loads
	React.useEffect(() => {
		if (userProfile?.baseCurrency) {
			form.setValue("baseCurrency", userProfile.baseCurrency);
		}
	}, [userProfile, form]);

	function onSubmit(values: z.infer<typeof currencySettingsSchema>) {
		updateBaseCurrencyMutation.mutate({
			baseCurrency: values.baseCurrency,
		});
	}

	if (isLoading) {
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
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
					<FormField
						control={form.control}
						name="baseCurrency"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Base Currency</FormLabel>
								<FormDescription>
									All subscription prices will be converted to and displayed in
									this currency.
								</FormDescription>
								<FormControl>
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger>
											<SelectValue placeholder="Select a currency" />
										</SelectTrigger>
										<SelectContent>
											{CURRENCIES.map((currency) => (
												<SelectItem key={currency} value={currency}>
													{CURRENCY_SYMBOLS[currency]} {currency}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="flex justify-end">
						<Button
							type="submit"
							disabled={updateBaseCurrencyMutation.isPending}
							className="w-full sm:w-auto"
						>
							{updateBaseCurrencyMutation.isPending
								? "Updating..."
								: "Update Currency"}
						</Button>
					</div>
				</form>
			</Form>
		</section>
	);
};
