import { TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { WrapperDialogVaul } from "~/components/ui/vaul-dialog";
import type { Category } from "~/server/db/schema";
import { api } from "~/utils/api";

export const DeleteCategoryDialog = ({
	category,
}: {
	category: Pick<Category, "id" | "name">;
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const apiUtils = api.useUtils();
	const deleteCategoryMutation = api.category.delete.useMutation({
		onSuccess: () => {
			toast.success("Category deleted!");
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
				Delete category:{" "}
				<span className="font-medium italic">{category.name}</span>
			</WrapperDialogVaul.Title>
			<WrapperDialogVaul.Description>
				Are you sure you want to delete this category?
			</WrapperDialogVaul.Description>
			<WrapperDialogVaul.Footer>
				<Button variant="destructive" onClick={onDelete}>
					Delete
				</Button>
				<Button variant="outline" onClick={() => setIsOpen(false)}>
					Cancel
				</Button>
			</WrapperDialogVaul.Footer>
		</WrapperDialogVaul>
	);
};
