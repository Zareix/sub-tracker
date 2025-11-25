import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4-mini";
import { ImageFileUploader } from "~/components/image-uploader";
import { ImageSearch } from "~/components/subscriptions/image-search";
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
import { api, type RouterOutputs } from "~/trpc/react";

const paymentMethodCreateSchema = z.object({
	name: z.string(),
	image: z.optional(z.string()),
});

export const EditCreateForm = ({
	paymentMethod,
	onFinished,
}: {
	paymentMethod?: RouterOutputs["paymentMethod"]["getAll"][number];
	onFinished?: () => void;
}) => {
	const t = useTranslations("SettingsPage");
	const tCommon = useTranslations("Common");
	const apiUtils = api.useUtils();
	const createPaymentMethodMutation = api.paymentMethod.create.useMutation({
		onSuccess: () => {
			toast.success(t("paymentMethods.createdSuccess"));
			apiUtils.paymentMethod.getAll.invalidate().catch(console.error);
			onFinished?.();
			setTimeout(() => {
				form.reset();
			}, 300);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
	const editPaymentMethodMutation = api.paymentMethod.edit.useMutation({
		onSuccess: () => {
			toast.success(t("paymentMethods.editedSuccess"));
			apiUtils.paymentMethod.getAll.invalidate().catch(console.error);
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
		resolver: zodResolver(paymentMethodCreateSchema),
		defaultValues: {
			name: paymentMethod?.name ?? "",
			image: paymentMethod?.image ?? undefined,
		},
	});

	function onSubmit(values: z.infer<typeof paymentMethodCreateSchema>) {
		if (paymentMethod) {
			editPaymentMethodMutation.mutate({
				...values,
				id: paymentMethod.id,
			});
		} else {
			createPaymentMethodMutation.mutate(values);
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-8">
				<div className="grid grid-cols-12 items-center gap-2">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem className="col-span-8">
								<FormLabel>{tCommon("form.name")}</FormLabel>
								<FormControl>
									<Input placeholder="PayPal" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<ImageFileUploader
						setFileUrl={(v) => form.setValue("image", v)}
						fileUrl={form.watch("image")}
					/>
					<ImageSearch
						query={form.watch("name")}
						setFileUrl={(imageUrl) => form.setValue("image", imageUrl)}
					/>
				</div>
				<DialogFooter>
					<Button type="submit">{tCommon("actions.submit")}</Button>
				</DialogFooter>
			</form>
		</Form>
	);
};
