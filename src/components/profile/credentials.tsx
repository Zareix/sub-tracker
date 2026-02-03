"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircleIcon, TrashIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4-mini";
import { ApiKeys } from "~/components/profile/api-keys";
import { Button } from "~/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "~/components/ui/field";
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
	const tCommon = useTranslations("Common");
	const queryClient = useQueryClient();
	const changePasswordMutation = useMutation({
		mutationFn: async (data: z.infer<typeof changePasswordSchema>) => {
			return authClient.changePassword({
				currentPassword: data.currentPassword,
				newPassword: data.newPassword,
			});
		},
		onSuccess: () => {
			toast.success(t("password.changedSuccess"));
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
			toast.success(t("passkey.registeredSuccess"));
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
			toast.success(t("passkey.removedSuccess"));
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
	const passwordForm = useForm<z.infer<typeof changePasswordSchema>>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});
	const passkeyForm = useForm<z.infer<typeof passKeySchema>>({
		resolver: zodResolver(passKeySchema),
		defaultValues: {
			name: "",
		},
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
				<h3 className="mb-2 font-semibold text-lg">{t("passkey.title")}</h3>
				{passKeysQuery.isLoading ? (
					<p>{t("passkey.loading")}</p>
				) : !passKeysQuery.data ||
					passKeysQuery.isError ||
					passKeysQuery.data.length === 0 ? (
					<p className="text-muted-foreground">{t("passkey.noRegistered")}</p>
				) : (
					<ul>
						{passKeysQuery.data.map((passkey) => (
							<li
								key={passkey.id}
								className="flex items-center gap-2 rounded-lg border px-4 py-2"
							>
								<span className="font-medium">{passkey.name}</span>
								<span className="text-muted-foreground text-xs">
									{tCommon("createdOn", {
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
				<form
					onSubmit={passkeyForm.handleSubmit(onPasskeySubmit)}
					className="mt-4"
				>
					<FieldGroup>
						<Controller
							control={passkeyForm.control}
							name="name"
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="passkey-name">
										{t("passkey.name")}
									</FieldLabel>
									<Input
										{...field}
										id="passkey-name"
										aria-invalid={fieldState.invalid}
										placeholder={t("passkey.placeholder")}
									/>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>
						<div className="flex justify-end">
							<Button type="submit">{t("passkey.register")}</Button>
						</div>
					</FieldGroup>
				</form>
			</div>
			<Separator className="my-8" />
			<ApiKeys userId={userId} />
			<Separator className="my-8" />
			<h3 className="font-semibold text-lg">{t("password.change")}</h3>
			<form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
				<FieldGroup>
					<Controller
						control={passwordForm.control}
						name="currentPassword"
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor="password-current">
									{t("password.current")}
								</FieldLabel>
								<Input
									{...field}
									id="password-current"
									type="password"
									aria-invalid={fieldState.invalid}
									placeholder={t("password.currentPlaceholder")}
									autoComplete="current-password"
								/>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>
					<Controller
						control={passwordForm.control}
						name="newPassword"
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor="password-new">
									{t("password.new")}
								</FieldLabel>
								<Input
									{...field}
									id="password-new"
									type="password"
									aria-invalid={fieldState.invalid}
									placeholder={t("password.newPlaceholder")}
									autoComplete="new-password"
								/>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>
					<Controller
						control={passwordForm.control}
						name="confirmPassword"
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor="password-confirm">
									{t("password.confirm")}
								</FieldLabel>
								<Input
									{...field}
									id="password-confirm"
									type="password"
									aria-invalid={fieldState.invalid}
									placeholder={t("password.confirmPlaceholder")}
									autoComplete="new-password"
								/>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>
					<div className="flex justify-end">
						<Button
							type="submit"
							disabled={changePasswordMutation.isPending}
							className="w-full sm:w-auto"
						>
							{changePasswordMutation.isPending
								? t("password.changing")
								: t("password.change")}
						</Button>
					</div>
				</FieldGroup>
			</form>
		</section>
	);
};
