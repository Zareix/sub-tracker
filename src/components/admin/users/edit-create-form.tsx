import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4-mini";
import { ImageFileUploader } from "~/components/image-uploader";
import { Button } from "~/components/ui/button";
import { DialogFooter } from "~/components/ui/dialog";
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
import { UserRoles } from "~/lib/constant";
import { api } from "~/trpc/react";

const userCreateSchema = z.object({
	image: z.nullish(z.string()),
	name: z.string().check(z.minLength(1, "Name is required")),
	email: z.email(),
	password: z.optional(z.string()),
	role: z.enum(UserRoles),
});

export const EditCreateForm = ({
	user,
	onFinished,
}: {
	user?: z.infer<typeof userCreateSchema> & { id: string };
	onFinished?: () => void;
}) => {
	const t = useTranslations("AdminPage");
	const tCommon = useTranslations("Common");
	const session = authClient.useSession();
	const apiUtils = api.useUtils();
	const createUserMutation = useMutation({
		mutationFn: (data: z.infer<typeof userCreateSchema>) => {
			if (!data.password || data.password.length < 8) {
				throw new Error(t("users.passwordMinLength"));
			}
			return authClient.admin.createUser({
				name: data.name,
				email: data.email,
				password: data.password ?? "",
				role: data.role,
				data: {
					image: data.image,
				},
			});
		},
		onSuccess: () => {
			toast.success(t("users.createdSuccess"));
			apiUtils.user.getAll.invalidate().catch(console.error);
			onFinished?.();
			setTimeout(() => {
				form.reset();
			}, 300);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
	const editUserApiMutation = api.user.edit.useMutation();
	const editUserMutation = useMutation({
		mutationFn: (data: z.infer<typeof userCreateSchema> & { id: string }) => {
			if (data.password && data.password.length > 0) {
				authClient.admin.setUserPassword({
					userId: data.id,
					newPassword: data.password,
				});
			}
			if (data.role !== user?.role) {
				authClient.admin.setRole({
					userId: data.id,
					role: data.role,
				});
			}
			// TODO Remove this when https://github.com/better-auth/better-auth/issues/2394 is addressed
			return editUserApiMutation.mutateAsync({
				id: data.id,
				name: data.name,
				email: data.email,
				image: data.image,
			});
		},
		onSuccess: () => {
			toast.success(t("users.editedSuccess"));
			apiUtils.user.getAll.invalidate().catch(console.error);
			onFinished?.();
			setTimeout(() => {
				form.reset();
			}, 300);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const form = useForm<z.infer<typeof userCreateSchema>>({
		resolver: zodResolver(userCreateSchema),
		defaultValues: {
			name: user?.name ?? "",
			email: user?.email ?? "",
			image: user?.image ?? undefined,
			role: user?.role ?? "user",
		},
	});

	function onSubmit(values: z.infer<typeof userCreateSchema>) {
		if (user) {
			editUserMutation.mutate({
				...values,
				id: user.id,
			});
		} else {
			createUserMutation.mutate(values);
		}
	}

	const isCurrentUser = session.data?.user.id === user?.id;

	return (
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
							<Field data-invalid={fieldState.invalid} className="col-span-10">
								<FieldLabel htmlFor="user-name">
									{tCommon("form.name")}
								</FieldLabel>
								<Input
									{...field}
									id="user-name"
									aria-invalid={fieldState.invalid}
									placeholder="Raphael"
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
								aria-invalid={fieldState.invalid}
								placeholder="raphael"
							/>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
				<Controller
					control={form.control}
					name="password"
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor="user-password">
								{tCommon("form.password")}
							</FieldLabel>
							<Input
								{...field}
								id="user-password"
								type="password"
								aria-invalid={fieldState.invalid}
								placeholder="***"
							/>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
				<Controller
					control={form.control}
					name="role"
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor="user-role">
								{tCommon("form.role")}
							</FieldLabel>
							<Select
								name={field.name}
								value={field.value}
								onValueChange={field.onChange}
								disabled={isCurrentUser}
							>
								<SelectTrigger
									id="user-role"
									aria-invalid={fieldState.invalid}
									className="min-w-42.5 capitalize"
								>
									<SelectValue placeholder={tCommon("form.selectRole")} />
								</SelectTrigger>
								<SelectContent>
									{UserRoles.map((role) => (
										<SelectItem value={role} key={role} className="capitalize">
											{role}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
				<DialogFooter>
					<Button type="submit">{tCommon("actions.submit")}</Button>
				</DialogFooter>
			</FieldGroup>
		</form>
	);
};
