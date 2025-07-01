import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircleIcon, TrashIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4-mini";
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
	const queryClient = useQueryClient();
	const changePasswordMutation = useMutation({
		mutationFn: async (data: z.infer<typeof changePasswordSchema>) => {
			return authClient.changePassword({
				currentPassword: data.currentPassword,
				newPassword: data.newPassword,
			});
		},
		onSuccess: () => {
			toast.success("Password changed successfully!");
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
			toast.success("Passkey registered successfully!");
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
			toast.success("Passkey removed successfully!");
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
			<h2 className="mb-4 font-bold text-2xl">Credentials</h2>
			<div>
				<h3 className="mb-2 font-semibold text-lg">Passkey</h3>
				{passKeysQuery.isLoading ? (
					<p>Loading passkeys...</p>
				) : !passKeysQuery.data ||
					passKeysQuery.isError ||
					passKeysQuery.data.length === 0 ? (
					<p>No passkeys registered.</p>
				) : (
					<ul>
						{passKeysQuery.data.map((passkey) => (
							<li key={passkey.id} className="flex items-center gap-3 py-2">
								<Button
									variant="ghost"
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
								<span className="text-sm">{passkey.name}</span>
								<span className="text-muted-foreground text-xs">
									added on {new Date(passkey.createdAt).toLocaleDateString()}
								</span>
							</li>
						))}
					</ul>
				)}
				<Form {...passkeyForm}>
					<form
						onSubmit={passkeyForm.handleSubmit(onPasskeySubmit)}
						className="mt-4 flex w-full items-center gap-4"
					>
						<FormField
							control={passkeyForm.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormControl className="w-full">
										<Input placeholder="Name for your new passkey" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" size="lg">
							Register Passkey
						</Button>
					</form>
				</Form>
			</div>
			<Separator className="my-8" />
			<h3 className="font-semibold text-lg">Change Password</h3>
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
								<FormLabel>Current Password</FormLabel>
								<FormControl>
									<Input
										type="password"
										placeholder="Enter your current password"
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
								<FormLabel>New Password</FormLabel>
								<FormControl>
									<Input
										type="password"
										placeholder="Enter your new password"
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
								<FormLabel>Confirm New Password</FormLabel>
								<FormControl>
									<Input
										type="password"
										placeholder="Confirm your new password"
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
								? "Changing Password..."
								: "Change Password"}
						</Button>
					</div>
				</form>
			</Form>
		</section>
	);
};
