import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { EditCreateForm } from "~/components/admin/users/edit-create-form";
import { Button } from "~/components/ui/button";
import { WrapperDialogVaul } from "~/components/ui/vaul-dialog";

export const CreateUserDialog = () => {
	const t = useTranslations("AdminPage");
	const tCommon = useTranslations("Common");
	const [isOpen, setIsOpen] = useState(false);

	return (
		<WrapperDialogVaul isOpen={isOpen} setIsOpen={setIsOpen}>
			<WrapperDialogVaul.Trigger>
				<Button>
					<PlusIcon size={20} />
					<span>{tCommon("addNew")}</span>
				</Button>
			</WrapperDialogVaul.Trigger>
			<WrapperDialogVaul.Title>{t("createUser")}</WrapperDialogVaul.Title>
			<EditCreateForm onFinished={() => setIsOpen(false)} />
		</WrapperDialogVaul>
	);
};
