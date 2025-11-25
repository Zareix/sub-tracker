"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type { UserWithRole } from "better-auth/plugins/admin";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4-mini";
import { ImageFileUploader } from "~/components/image-uploader";
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
	name: z.string(),
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
	const form = useForm({
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
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
					<div className="grid grid-cols-12 gap-2">
						<ImageFileUploader
							setFileUrl={(v) => form.setValue("image", v)}
							fileUrl={form.watch("image")}
						/>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem className="col-span-10">
									<FormLabel>{tCommon("form.name")}</FormLabel>
									<FormControl>
										<Input placeholder="Your name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{tCommon("form.email")}</FormLabel>
								<FormControl>
									<Input
										type="email"
										placeholder="your.email@example.com"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormItem>
						<FormLabel>{tCommon("form.role")}</FormLabel>
						<FormControl>
							<Select value={user.role ?? "user"} disabled>
								<SelectTrigger className="capitalize">
									<SelectValue placeholder={tCommon("form.role")} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem
										value={user.role ?? "user"}
										className="capitalize"
									>
										{user.role}
									</SelectItem>
								</SelectContent>
							</Select>
						</FormControl>
						<FormMessage />
					</FormItem>

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
				</form>
			</Form>
		</section>
	);
};
