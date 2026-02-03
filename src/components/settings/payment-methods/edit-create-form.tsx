import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4-mini";
import { ImageFileUploader } from "~/components/image-uploader";
import { ImageSearch } from "~/components/subscriptions/image-search";
import { Button } from "~/components/ui/button";
import { DialogFooter } from "~/components/ui/dialog";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { api, type RouterOutputs } from "~/trpc/react";

const paymentMethodCreateSchema = z.object({
	name: z.string().check(
		z.minLength(1, {
			error: "Name is required",
		}),
	),
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

	const form = useForm<z.infer<typeof paymentMethodCreateSchema>>({
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
		<form onSubmit={form.handleSubmit(onSubmit)}>
			<FieldGroup>
				<div className="grid grid-cols-12 items-center gap-2">
					<Controller
						control={form.control}
						name="name"
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid} className="col-span-8">
								<FieldLabel htmlFor="payment-method-name">
									{tCommon("form.name")}
								</FieldLabel>
								<Input
									{...field}
									id="payment-method-name"
									aria-invalid={fieldState.invalid}
									placeholder="PayPal"
								/>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
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
			</FieldGroup>
		</form>
	);
};
