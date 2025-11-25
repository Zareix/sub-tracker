import { EditIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { EditCreateForm } from "~/components/settings/payment-methods/edit-create-form";
import { Button } from "~/components/ui/button";
import { WrapperDialogVaul } from "~/components/ui/vaul-dialog";
import type { RouterOutputs } from "~/trpc/react";

type Props = {
	paymentMethod: RouterOutputs["paymentMethod"]["getAll"][number];
};

export const EditPaymentMethodDialog = ({ paymentMethod }: Props) => {
	const t = useTranslations("SettingsPage");
	const [isOpen, setIsOpen] = useState(false);
	return (
		<WrapperDialogVaul isOpen={isOpen} setIsOpen={setIsOpen}>
			<WrapperDialogVaul.Trigger>
				<Button variant="ghost" className="w-8" size="icon">
					<EditIcon size={20} />
				</Button>
			</WrapperDialogVaul.Trigger>
			<WrapperDialogVaul.Title>
				{t("paymentMethods.edit")}
			</WrapperDialogVaul.Title>
			<EditCreateForm
				onFinished={() => setIsOpen(false)}
				paymentMethod={paymentMethod}
			/>
		</WrapperDialogVaul>
	);
};
