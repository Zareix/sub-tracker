import { TrashIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { WrapperDialogVaul } from "~/components/ui/vaul-dialog";
import type { PaymentMethod } from "~/server/db/schema";
import { api } from "~/trpc/react";

export const DeletePaymentMethodDialog = ({
	paymentMethod,
}: {
	paymentMethod: Pick<PaymentMethod, "id" | "name">;
}) => {
	const t = useTranslations("SettingsPage");
	const tCommon = useTranslations("Common");
	const [isOpen, setIsOpen] = useState(false);
	const apiUtils = api.useUtils();
	const deletePaymentMethodMutation = api.paymentMethod.delete.useMutation({
		onSuccess: () => {
			toast.success(t("paymentMethods.deletedSuccess"));
			apiUtils.paymentMethod.getAll.invalidate().catch(console.error);
			setIsOpen(false);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	function onDelete() {
		deletePaymentMethodMutation.mutate(paymentMethod.id);
	}

	return (
		<WrapperDialogVaul isOpen={isOpen} setIsOpen={setIsOpen}>
			<WrapperDialogVaul.Trigger>
				<Button
					variant="ghost"
					className="w-8 text-destructive"
					size="icon"
					disabled={paymentMethod.id === 1}
				>
					<TrashIcon size={20} />
				</Button>
			</WrapperDialogVaul.Trigger>
			<WrapperDialogVaul.Title>
				{t("paymentMethods.delete")}:{" "}
				<span className="font-medium italic">{paymentMethod.name}</span>
			</WrapperDialogVaul.Title>
			<WrapperDialogVaul.Description>
				{t("paymentMethods.deleteConfirm")}
			</WrapperDialogVaul.Description>
			<WrapperDialogVaul.Footer>
				<Button variant="destructive" onClick={onDelete}>
					{tCommon("actions.delete")}
				</Button>
				<Button variant="outline" onClick={() => setIsOpen(false)}>
					{tCommon("actions.cancel")}
				</Button>
			</WrapperDialogVaul.Footer>
		</WrapperDialogVaul>
	);
};
