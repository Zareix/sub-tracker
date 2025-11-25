"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircleIcon, TrashIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4-mini";
import { ApiKeys } from "~/components/profile/api-keys";
import { Button } from "~/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { authClient } from "~/lib/auth-client";

const changePasswordSchema = z
	.object({
		currentPassword: z
			.string()
			.check(z.minLength(1, "Current password is required")),
		newPassword: z
			.string()
			.check(z.minLength(8, "New password must be at least 8 characters long")),
		confirmPassword: z
			.string()
			.check(z.minLength(1, "Please confirm your new password")),
	})
	.check(
		z.refine((data) => data.newPassword === data.confirmPassword, {
			message: "Passwords don't match",
			path: ["confirmPassword"],
		}),
	);

const passKeySchema = z.object({
	name: z.string().check(z.minLength(1, "Passkey name is required")),
});

type Props = {
	userId: string;
};

export const CredentialsForm = ({ userId }: Props) => {
	const t = useTranslations("ProfilePage");
	const queryClient = useQueryClient();
	const changePasswordMutation = useMutation({
		mutationFn: async (data: z.infer<typeof changePasswordSchema>) => {
			return authClient.changePassword({
				currentPassword: data.currentPassword,
				newPassword: data.newPassword,
			});
		},
		onSuccess: () => {
			toast.success(t("passwordChangedSuccess"));
			passwordForm.reset();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to change password");
		},
	});
	const registerPasskeyMutation = useMutation({
		mutationFn: (data: z.infer<typeof passKeySchema>) =>
			authClient.passkey.addPasskey({
				name: data.name,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["passkeys", userId],
			});
			passkeyForm.reset();
			toast.success(t("passkeyRegisteredSuccess"));
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to register passkey");
		},
	});
	const removePasskeyMutation = useMutation({
		mutationFn: async (passkeyId: string) => {
			return authClient.passkey.deletePasskey({
				id: passkeyId,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["passkeys", userId],
			});
			toast.success(t("passkeyRemovedSuccess"));
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to remove passkey");
		},
	});
	const passKeysQuery = useQuery({
		queryKey: ["passkeys", userId],
		queryFn: () => authClient.passkey.listUserPasskeys(),
		select: (data) => {
			return data.data;
		},
	});
	const passwordForm = useForm({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});
	const passkeyForm = useForm({
		resolver: zodResolver(passKeySchema),
	});

	function onPasswordSubmit(values: z.infer<typeof changePasswordSchema>) {
		changePasswordMutation.mutate(values);
	}

	function onPasskeySubmit(values: z.infer<typeof passKeySchema>) {
		registerPasskeyMutation.mutate({
			name: values.name,
		});
	}

	return (
		<section>
			<h2 className="mb-4 font-bold text-2xl">{t("credentials")}</h2>
			<div>
				<h3 className="mb-2 font-semibold text-lg">{t("passkey")}</h3>
				{passKeysQuery.isLoading ? (
					<p>{t("loadingPasskeys")}</p>
				) : !passKeysQuery.data ||
					passKeysQuery.isError ||
					passKeysQuery.data.length === 0 ? (
					<p className="text-muted-foreground">{t("noPasskeysRegistered")}</p>
				) : (
					<ul>
						{passKeysQuery.data.map((passkey) => (
							<li
								key={passkey.id}
								className="flex items-center gap-2 rounded-lg border px-4 py-2"
							>
								<span className="font-medium">{passkey.name}</span>
								<span className="text-muted-foreground text-xs">
									{t("createdOn", {
										date: new Date(passkey.createdAt).toLocaleDateString(),
									})}
								</span>
								<Button
									variant="ghost"
									className="ml-auto"
									size="icon"
									onClick={() => removePasskeyMutation.mutate(passkey.id)}
									disabled={removePasskeyMutation.isPending}
								>
									{removePasskeyMutation.isPending ? (
										<LoaderCircleIcon className="animate-spin" size={20} />
									) : (
										<TrashIcon size={20} className="text-destructive" />
									)}
								</Button>
							</li>
						))}
					</ul>
				)}
				<Form {...passkeyForm}>
					<form
						onSubmit={passkeyForm.handleSubmit(onPasskeySubmit)}
						className="mt-4 space-y-4"
					>
						<FormField
							control={passkeyForm.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("passkeyName")}</FormLabel>
									<FormControl className="w-full">
										<Input placeholder={t("passkeyPlaceholder")} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="flex justify-end">
							<Button type="submit">{t("registerPasskey")}</Button>
						</div>
					</form>
				</Form>
			</div>
			<Separator className="my-8" />
			<ApiKeys userId={userId} />
			<Separator className="my-8" />
			<h3 className="font-semibold text-lg">{t("changePassword")}</h3>
			<Form {...passwordForm}>
				<form
					onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
					className="grid gap-4"
				>
					<FormField
						control={passwordForm.control}
						name="currentPassword"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("currentPassword")}</FormLabel>
								<FormControl>
									<Input
										type="password"
										placeholder={t("currentPasswordPlaceholder")}
										autoComplete="current-password"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={passwordForm.control}
						name="newPassword"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("newPassword")}</FormLabel>
								<FormControl>
									<Input
										type="password"
										placeholder={t("newPasswordPlaceholder")}
										autoComplete="new-password"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={passwordForm.control}
						name="confirmPassword"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("confirmNewPassword")}</FormLabel>
								<FormControl>
									<Input
										type="password"
										placeholder={t("confirmNewPasswordPlaceholder")}
										autoComplete="new-password"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="flex justify-end">
						<Button
							type="submit"
							disabled={changePasswordMutation.isPending}
							className="w-full sm:w-auto"
						>
							{changePasswordMutation.isPending
								? t("changingPassword")
								: t("changePassword")}
						</Button>
					</div>
				</form>
			</Form>
		</section>
	);
};
