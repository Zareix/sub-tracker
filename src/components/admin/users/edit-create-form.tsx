import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Select } from "@radix-ui/react-select";
import { useRouter } from "next/router";
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
import { useSession } from "~/lib/auth-client";
import { UserRoles } from "~/lib/constant";
import { type RouterOutputs, api } from "~/utils/api";

const userCreateSchema = z.object({
	image: z.optional(z.string()),
	name: z.string(),
	email: z.string(),
	password: z.optional(z.string()),
	role: z.enum(UserRoles),
});

export const EditCreateForm = ({
	user,
	onFinished,
}: {
	user?: Pick<
		RouterOutputs["user"]["getAll"][number],
		"id" | "name" | "email" | "role" | "image"
	>;
	onFinished?: () => void;
}) => {
	const session = useSession();
	const router = useRouter();
	const apiUtils = api.useUtils();
	const createUserMutation = api.user.create.useMutation({
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
	const editUserMutation = api.user.edit.useMutation({
		onSuccess: (data) => {
			toast.success("User edited!");
			apiUtils.user.getAll.invalidate().catch(console.error);
			onFinished?.();
			setTimeout(() => {
				form.reset();
			}, 300);
			if (session.data?.user.id === data.id) {
				router.reload();
			}
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const form = useForm<z.infer<typeof userCreateSchema>>({
		resolver: standardSchemaResolver(userCreateSchema),
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
			createUserMutation.mutate({ ...values, password: values.password ?? "" });
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
