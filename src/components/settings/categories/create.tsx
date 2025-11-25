import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { EditCreateForm } from "~/components/settings/categories/edit-create-form";
import { Button } from "~/components/ui/button";
import { WrapperDialogVaul } from "~/components/ui/vaul-dialog";

export const CreateCategoryDialog = () => {
	const t = useTranslations("SettingsPage");
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
			<WrapperDialogVaul.Title>{t("createCategory")}</WrapperDialogVaul.Title>
			<EditCreateForm onFinished={() => setIsOpen(false)} />
		</WrapperDialogVaul>
	);
};
