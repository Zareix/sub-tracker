import { zodResolver } from "@hookform/resolvers/zod";
import { Select } from "@radix-ui/react-select";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4-mini";
import { ImageFileUploader } from "~/components/image-uploader";
import { Button } from "~/components/ui/button";
import { DialogFooter } from "~/components/ui/dialog";
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
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { authClient } from "~/lib/auth-client";
import { UserRoles } from "~/lib/constant";
import { api } from "~/utils/api";

const userCreateSchema = z.object({
	image: z.nullish(z.string()),
	name: z.string(),
	email: z.string(),
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
	const session = authClient.useSession();
	const apiUtils = api.useUtils();
	const createUserMutation = useMutation({
		mutationFn: (data: z.infer<typeof userCreateSchema>) => {
			if (!data.password || data.password.length < 8) {
				throw new Error("Password must be at least 8 characters long");
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
			toast.success("User created!");
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
			toast.success("User edited!");
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

	const form = useForm({
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
								<FormLabel>Name</FormLabel>
								<FormControl>
									<Input placeholder="Raphael" {...field} />
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
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input placeholder="raphael" {...field} />
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Password</FormLabel>
							<FormControl>
								<Input placeholder="***" type="password" {...field} />
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="role"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Role</FormLabel>
							<FormControl>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
									disabled={isCurrentUser}
								>
									<FormControl>
										<SelectTrigger className="min-w-[170px] capitalize">
											<SelectValue placeholder="Select role" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{UserRoles.map((role) => (
											<SelectItem
												value={role}
												key={role}
												className="capitalize"
											>
												{role}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>
				<DialogFooter>
					<Button type="submit">Submit</Button>
				</DialogFooter>
			</form>
		</Form>
	);
};
