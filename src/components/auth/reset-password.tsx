"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CalendarSyncIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { useRouter } from "~/i18n/navigation";
import { authClient } from "~/lib/auth-client";

const loginSchema = z.object({
	newPassword: z.string().min(8),
	token: z.string(),
});

export const ResetPasswordForm = ({ token }: { token: string }) => {
	const router = useRouter();
	const t = useTranslations("ResetPasswordPage");
	const resetPasswordMutation = useMutation({
		mutationFn: async (values: z.infer<typeof loginSchema>) => {
			return authClient.resetPassword(values);
		},
		onSuccess: (res) => {
			if (res.error) {
				toast.error(res.error.message ?? t("errors.resetFailed"));
			} else {
				toast.success(t("success.passwordReset"));
				router.push("/login");
			}
		},
		onError: () => {
			toast.error(t("errors.resetFailed"));
		},
	});
	const form = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			newPassword: "",
			token: token ?? "",
		},
		disabled: resetPasswordMutation.isPending,
	});

	const onSubmit = (values: z.infer<typeof loginSchema>) => {
		resetPasswordMutation.mutate(values);
	};

	return (
		<Card className="w-full max-w-sm">
			<CardHeader>
				<Link
					href="#"
					className="flex items-center gap-2 self-center py-4 font-medium text-xl"
				>
					<div className="flex size-9 items-center justify-center rounded-xs bg-primary text-primary-foreground">
						<CalendarSyncIcon className="size-5.5" />
					</div>
					Subtracker
				</Link>
				<CardTitle className="text-2xl">{t("title")}</CardTitle>
			</CardHeader>
			<CardContent className="mt-4">
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<FieldGroup>
						<Controller
							control={form.control}
							name="newPassword"
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="reset-password">
										{t("fields.newPassword")}
									</FieldLabel>
									<Input
										{...field}
										id="reset-password"
										type="password"
										aria-invalid={fieldState.invalid}
										placeholder={t("fields.newPasswordPlaceholder")}
									/>
									{fieldState.error && (
										<FieldError
											errors={[
												{
													...fieldState.error,
													message: t("errors.passwordMinLength"),
												},
											]}
										/>
									)}
								</Field>
							)}
						/>
						<Button type="submit" className="w-full">
							{t("actions.submit")}
						</Button>
					</FieldGroup>
				</form>
			</CardContent>
		</Card>
	);
};
