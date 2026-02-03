import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CalendarSyncIcon, KeySquareIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4-mini";
import { AuthProvidersIcon } from "~/components/login/auth-providers-icon";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { type AuthProvider, authClient } from "~/lib/auth-client";
import { api } from "~/trpc/react";

const loginSchema = z.object({
	email: z.string(),
	password: z.string(),
});

export const LoginForm = () => {
	const router = useRouter();
	const availableProvidersQuery = api.user.authProviders.useQuery();
	const signInMutation = useMutation({
		mutationFn: async (values: z.infer<typeof loginSchema>) => {
			return authClient.signIn.email({
				email: values.email.trim(),
				password: values.password,
			});
		},
		onSuccess: (res) => {
			if (res.error) {
				toast.error(res.error.message ?? "Could not login, please try again.");
			}
		},
		onError: () => {
			toast.error("Could not login, please try again.");
		},
	});
	const signInPassKeyMutation = useMutation({
		mutationFn: async () => {
			return authClient.signIn.passkey();
		},
		onSuccess: (res) => {
			if (res?.error) {
				toast.error(res?.error.message ?? "Could not login, please try again.");
			} else {
				router.refresh();
			}
		},
		onError: () => {
			toast.error("Could not login, please try again.");
		},
	});
	const signInOAuthMutation = useMutation({
		mutationFn: async (providerId: AuthProvider) => {
			return authClient.signIn.oauth2({
				providerId: providerId.replace("oauth-", ""),
			});
		},
		onSuccess: (res) => {
			if (res?.error) {
				toast.error(res?.error.message ?? "Could not login, please try again.");
			}
		},
		onError: () => {
			toast.error("Could not login, please try again.");
		},
	});

	const form = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	function onSubmit(values: z.infer<typeof loginSchema>) {
		signInMutation.mutate(values);
	}

	function resetPassword() {
		const email = form.getValues("email");
		if (!email) {
			toast.error("Please enter your email first.");
			return;
		}
		authClient
			.requestPasswordReset({
				email: email.trim(),
				redirectTo: "/",
			})
			.then((res) => {
				if (res.error) {
					throw new Error(res.error.message);
				}
				toast.success("If that email exists, a reset link has been sent.");
			})
			.catch(() => {
				toast.error("Could not request password reset, please try again.");
			});
	}

	if (availableProvidersQuery.isLoading) {
		return <div />;
	}

	if (availableProvidersQuery.isError || !availableProvidersQuery.data) {
		return <div>An error occured loading auth providers. Please retry</div>;
	}

	return (
		<Card className="from-card">
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
				<CardTitle className="text-2xl">Login</CardTitle>
			</CardHeader>
			<CardContent className="mt-4 grid gap-3">
				{availableProvidersQuery.data.map((provider) => (
					<Fragment key={provider}>
						{provider === "password" && (
							<>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="flex flex-col gap-6"
								>
									<FieldGroup>
										<Controller
											control={form.control}
											name="email"
											render={({ field, fieldState }) => (
												<Field data-invalid={fieldState.invalid}>
													<FieldLabel htmlFor="login-email">Email</FieldLabel>
													<Input
														{...field}
														id="login-email"
														aria-invalid={fieldState.invalid}
														placeholder="raphael@example.com"
														autoComplete="email webauthn"
													/>
													{fieldState.invalid && (
														<FieldError errors={[fieldState.error]} />
													)}
												</Field>
											)}
										/>
										<Controller
											control={form.control}
											name="password"
											render={({ field, fieldState }) => (
												<Field data-invalid={fieldState.invalid}>
													<div className="flex items-end">
														<FieldLabel htmlFor="login-password">
															Password
														</FieldLabel>
														<Button
															variant="link"
															className="m-0 ml-auto h-4 p-0"
															onClick={resetPassword}
															type="button"
														>
															Forgot password?
														</Button>
													</div>
													<Input
														{...field}
														id="login-password"
														type="password"
														aria-invalid={fieldState.invalid}
														placeholder="********"
														autoComplete="current-password webauthn"
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
								<FieldSeparator className="my-2">
									Or continue with
								</FieldSeparator>
							</>
						)}
						{provider === "password" && (
							<Button
								onClick={() => {
									signInPassKeyMutation.mutate();
								}}
								variant="outline"
								className="w-full"
							>
								<KeySquareIcon size={16} />
								Login with passkey
							</Button>
						)}
						{provider.startsWith("oauth-") && (
							<Button
								onClick={() => {
									signInOAuthMutation.mutate(provider);
								}}
								variant="outline"
								className="w-full"
							>
								<AuthProvidersIcon providerId={provider} />
								Login with {provider.replace("oauth-", "")}
							</Button>
						)}
					</Fragment>
				))}
			</CardContent>
		</Card>
	);
};
