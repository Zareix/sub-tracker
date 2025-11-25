import { TrashIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { WrapperDialogVaul } from "~/components/ui/vaul-dialog";
import type { Category } from "~/server/db/schema";
import { api } from "~/trpc/react";

export const DeleteCategoryDialog = ({
	category,
}: {
	category: Pick<Category, "id" | "name">;
}) => {
	const t = useTranslations("SettingsPage");
	const tCommon = useTranslations("Common");
	const [isOpen, setIsOpen] = useState(false);
	const apiUtils = api.useUtils();
	const deleteCategoryMutation = api.category.delete.useMutation({
		onSuccess: () => {
			toast.success(t("categoryDeleted"));
			apiUtils.category.getAll.invalidate().catch(console.error);
			setIsOpen(false);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	function onDelete() {
		deleteCategoryMutation.mutate(category.id);
	}

	return (
		<WrapperDialogVaul isOpen={isOpen} setIsOpen={setIsOpen}>
			<WrapperDialogVaul.Trigger>
				<Button
					variant="ghost"
					className="w-8 text-destructive"
					size="icon"
					disabled={category.id === 1}
				>
					<TrashIcon size={20} />
				</Button>
			</WrapperDialogVaul.Trigger>
			<WrapperDialogVaul.Title>
				{t("deleteCategory")}:{" "}
				<span className="font-medium italic">{category.name}</span>
			</WrapperDialogVaul.Title>
			<WrapperDialogVaul.Description>
				{t("deleteCategoryConfirm")}
			</WrapperDialogVaul.Description>
			<WrapperDialogVaul.Footer>
				<Button variant="destructive" onClick={onDelete}>
					{tCommon("delete")}
				</Button>
				<Button variant="outline" onClick={() => setIsOpen(false)}>
					{tCommon("cancel")}
				</Button>
			</WrapperDialogVaul.Footer>
		</WrapperDialogVaul>
	);
};
