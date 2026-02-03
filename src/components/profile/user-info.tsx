"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type { UserWithRole } from "better-auth/plugins/admin";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4-mini";
import { ImageFileUploader } from "~/components/image-uploader";
import { Button } from "~/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { authClient } from "~/lib/auth-client";
import { api } from "~/trpc/react";

const editUserInfoSchema = z.object({
	id: z.string(),
	name: z.string().check(z.minLength(1, "Name is required")),
	email: z.email(),
	image: z.nullish(z.string()),
});

type Props = {
	user: Pick<UserWithRole, "id" | "name" | "email" | "image" | "role">;
};

export const UserInfoForm = ({ user }: Props) => {
	const t = useTranslations("ProfilePage");
	const tCommon = useTranslations("Common");
	const apiUtils = api.useUtils();
	const editUserMutation = useMutation({
		mutationFn: async (data: z.infer<typeof editUserInfoSchema>) => {
			if (data.email !== user.email) {
				await authClient.changeEmail({
					newEmail: data.email,
				});
			}
			return await authClient.updateUser({
				name: data.name,
				image: data.image,
			});
		},
		onSuccess: () => {
			toast.success(t("info.updatedSuccess"));
			apiUtils.user.getAll.invalidate().catch(console.error);
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update profile");
		},
	});
	const form = useForm<z.infer<typeof editUserInfoSchema>>({
		resolver: zodResolver(editUserInfoSchema),
		defaultValues: user,
	});

	function onSubmit(values: z.infer<typeof editUserInfoSchema>) {
		editUserMutation.mutate({
			id: values.id,
			name: values.name,
			email: values.email,
			image: values.image,
		});
	}

	return (
		<section>
			<h2 className="mb-4 font-bold text-2xl">{t("info.title")}</h2>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<FieldGroup>
					<div className="grid grid-cols-12 gap-2">
						<ImageFileUploader
							setFileUrl={(v) => form.setValue("image", v)}
							fileUrl={form.watch("image")}
						/>
						<Controller
							control={form.control}
							name="name"
							render={({ field, fieldState }) => (
								<Field
									data-invalid={fieldState.invalid}
									className="col-span-10"
								>
									<FieldLabel htmlFor="user-name">
										{tCommon("form.name")}
									</FieldLabel>
									<Input
										{...field}
										id="user-name"
										aria-invalid={fieldState.invalid}
										placeholder="Your name"
									/>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>
					</div>
					<Controller
						control={form.control}
						name="email"
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor="user-email">
									{tCommon("form.email")}
								</FieldLabel>
								<Input
									{...field}
									id="user-email"
									type="email"
									aria-invalid={fieldState.invalid}
									placeholder="your.email@example.com"
								/>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>
					<Field>
						<FieldLabel htmlFor="user-role">{tCommon("form.role")}</FieldLabel>
						<Select value={user.role ?? "user"} disabled>
							<SelectTrigger id="user-role" className="capitalize">
								<SelectValue placeholder={tCommon("form.role")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={user.role ?? "user"} className="capitalize">
									{user.role}
								</SelectItem>
							</SelectContent>
						</Select>
					</Field>

					<div className="flex justify-end">
						<Button
							type="submit"
							disabled={editUserMutation.isPending}
							className="w-full sm:w-auto"
						>
							{editUserMutation.isPending
								? t("info.updating")
								: t("info.update")}
						</Button>
					</div>
				</FieldGroup>
			</form>
		</section>
	);
};
