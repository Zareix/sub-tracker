import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CalendarSyncIcon } from "lucide-react";
import Link from "next/link";
import { useQueryState } from "nuqs";
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
import { authClient } from "~/lib/auth-client";

const loginSchema = z.object({
	newPassword: z.string().min(8, "Password must be at least 8 characters long"),
	token: z.string(),
});

const ResetPassword = ({ token }: { token: string }) => {
	const [, setToken] = useQueryState("token");
	const resetPasswordMutation = useMutation({
		mutationFn: async (values: z.infer<typeof loginSchema>) => {
			return authClient.resetPassword(values);
		},
		onSuccess: (res) => {
			if (res.error) {
				toast.error(res.error.message ?? "Could not login, please try again.");
			} else {
				toast.success("Password reset successfully");
				setToken(null, { clearOnDefault: true });
			}
		},
		onError: () => {
			toast.error("Could not login, please try again.");
		},
	});
	const form = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			newPassword: "",
			token,
		},
		disabled: resetPasswordMutation.isPending,
	});

	const onSubmit = (values: z.infer<typeof loginSchema>) => {
		resetPasswordMutation.mutate(values);
	};

	return (
		<Card>
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
				<CardTitle className="text-2xl">Reset password</CardTitle>
			</CardHeader>
			<CardContent className="mt-4">
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<FieldGroup>
						<Controller
							control={form.control}
							name="newPassword"
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="reset-password">Password</FieldLabel>
									<Input
										{...field}
										id="reset-password"
										type="password"
										aria-invalid={fieldState.invalid}
										placeholder="********"
									/>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>
						<Button type="submit" className="w-full">
							Login
						</Button>
					</FieldGroup>
				</form>
			</CardContent>
		</Card>
	);
};

export default ResetPassword;
