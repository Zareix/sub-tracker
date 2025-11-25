import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CopyIcon, LoaderCircleIcon, TrashIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4-mini";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { authClient } from "~/lib/auth-client";

const createApiKeySchema = z.object({
	name: z.string().check(z.minLength(1, "API key name is required")),
	expiresIn: z.optional(z.number()),
});

type Props = {
	userId: string;
};

export const ApiKeys = ({ userId }: Props) => {
	const t = useTranslations("ProfilePage");
	const tCommon = useTranslations("Common");
	const [lastCreatedApiKey, setLastCreatedApiKey] = useState<{
		id: string;
		name: string;
		key: string;
		createdAt: string;
	} | null>(null);
	const queryClient = useQueryClient();

	const createApiKeyMutation = useMutation({
		mutationFn: async (data: z.infer<typeof createApiKeySchema>) => {
			return authClient.apiKey.create({
				name: data.name,
				expiresIn: data.expiresIn,
			});
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: ["apiKeys", userId],
			});
			apiKeyForm.reset();
			if (data?.data?.key) {
				setLastCreatedApiKey({
					id: data.data.id || "",
					name: data.data.name || "",
					key: data.data.key,
					createdAt: new Date().toISOString(),
				});
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create API key");
		},
	});

	const deleteApiKeyMutation = useMutation({
		mutationFn: async (apiKeyId: string) => {
			return authClient.apiKey.delete({
				keyId: apiKeyId,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["apiKeys", userId],
			});
			toast.success(t("apiKeys.deletedSuccess"));
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete API key");
		},
	});

	const apiKeysQuery = useQuery({
		queryKey: ["apiKeys", userId],
		queryFn: () => authClient.apiKey.list(),
		select: (data) => {
			return data.data;
		},
	});

	const apiKeyForm = useForm({
		resolver: zodResolver(createApiKeySchema),
		defaultValues: {
			name: "",
		},
	});

	function onApiKeySubmit(values: z.infer<typeof createApiKeySchema>) {
		createApiKeyMutation.mutate(values);
	}

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		toast.success(t("apiKeys.copied"));
	};

	const dismissLastCreatedKey = () => {
		setLastCreatedApiKey(null);
	};

	return (
		<section>
			<h3 className="mb-4 font-semibold text-lg">{t("apiKeys.title")}</h3>

			{lastCreatedApiKey && (
				<Card className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
					<CardHeader className="pb-3">
						<div className="flex items-center justify-between">
							<CardTitle className="text-green-800 text-lg dark:text-green-200">
								{t("apiKeys.newCreated")}
							</CardTitle>
							<Button
								variant="ghost"
								size="sm"
								onClick={dismissLastCreatedKey}
								className="h-6 w-6 p-0 text-green-600 hover:text-green-800 dark:text-green-400"
							>
								<XIcon size={16} />
							</Button>
						</div>
					</CardHeader>
					<CardContent className="space-y-3">
						<div>
							<p className="font-medium text-green-800 dark:text-green-200">
								{lastCreatedApiKey.name}
							</p>
							<p className="text-green-700 text-sm dark:text-green-300">
								{t("apiKeys.saveWarning")}
							</p>
						</div>
						<div className="flex items-center gap-2 rounded bg-green-100 p-3 dark:bg-green-900">
							<code className="flex-1 break-all font-mono text-green-800 text-sm dark:text-green-200">
								{lastCreatedApiKey.key}
							</code>

							<Button
								variant="ghost"
								size="sm"
								onClick={() => copyToClipboard(lastCreatedApiKey.key)}
								className="h-8 w-8 p-0 text-green-600 hover:text-green-800 dark:text-green-400"
							>
								<CopyIcon size={16} />
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{apiKeysQuery.isLoading ? (
				<div className="flex items-center gap-2">
					<LoaderCircleIcon className="animate-spin" size={16} />
					<p>{t("apiKeys.loading")}</p>
				</div>
			) : !apiKeysQuery.data ||
				apiKeysQuery.isError ||
				apiKeysQuery.data.length === 0 ? (
				<p className="text-muted-foreground">{t("apiKeys.noCreated")}</p>
			) : (
				<div className="space-y-3">
					{apiKeysQuery.data.map((apiKey) => {
						return (
							<div key={apiKey.id} className="rounded-lg border px-4 py-2">
								<div className="flex items-center gap-2">
									<span className="font-medium">{apiKey.name}</span>
									<span className="text-muted-foreground text-xs">
										{tCommon("createdOn", {
											date: new Date(apiKey.createdAt).toLocaleDateString(),
										})}
									</span>
									{apiKey.expiresAt && (
										<span className="rounded bg-muted px-2 py-1 text-muted-foreground text-xs">
											| {t("apiKeys.expires")}:{" "}
											{new Date(apiKey.expiresAt).toLocaleDateString()}
										</span>
									)}
									<Button
										variant="ghost"
										size="icon"
										onClick={() => deleteApiKeyMutation.mutate(apiKey.id)}
										disabled={deleteApiKeyMutation.isPending}
										className="ml-auto text-destructive hover:text-destructive"
									>
										{deleteApiKeyMutation.isPending ? (
											<LoaderCircleIcon className="animate-spin" size={20} />
										) : (
											<TrashIcon size={20} />
										)}
									</Button>
								</div>
							</div>
						);
					})}
				</div>
			)}

			<Form {...apiKeyForm}>
				<form
					onSubmit={apiKeyForm.handleSubmit(onApiKeySubmit)}
					className="mt-6 space-y-4"
				>
					<FormField
						control={apiKeyForm.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("apiKeys.name")}</FormLabel>
								<FormControl>
									<Input placeholder={t("apiKeys.placeholder")} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="flex justify-end">
						<Button
							type="submit"
							disabled={createApiKeyMutation.isPending}
							className="w-full sm:w-auto"
						>
							{createApiKeyMutation.isPending ? (
								<>
									<LoaderCircleIcon className="mr-2 animate-spin" size={16} />
									{t("apiKeys.creating")}
								</>
							) : (
								t("apiKeys.create")
							)}
						</Button>
					</div>
				</form>
			</Form>
		</section>
	);
};
