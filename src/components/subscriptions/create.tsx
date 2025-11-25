import { useTranslations } from "next-intl";
import { useState } from "react";
import { EditCreateForm } from "~/components/subscriptions/edit-create-form";
import { WrapperDialogVaul } from "~/components/ui/vaul-dialog";

export const CreateSubscriptionDialog = ({
	trigger,
}: {
	trigger?: React.ReactNode;
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const t = useTranslations("SubscriptionForm");

	return (
		<WrapperDialogVaul isOpen={isOpen} setIsOpen={setIsOpen}>
			<WrapperDialogVaul.Trigger>{trigger}</WrapperDialogVaul.Trigger>
			<WrapperDialogVaul.Title>{t("create.title")}</WrapperDialogVaul.Title>
			<EditCreateForm onFinished={() => setIsOpen(false)} />
		</WrapperDialogVaul>
	);
};
