import { TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
	DialogDescription,
	DialogFooter,
	DialogTitle,
} from "~/components/ui/dialog";
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
		<WrapperDialogVaul
			isOpen={isOpen}
			setIsOpen={setIsOpen}
			trigger={
				<Button
					variant="ghost"
					className="text-destructive w-8"
					size="icon"
					disabled={category.id === 1}
				>
					<TrashIcon size={20} />
				</Button>
			}
		>
			<DialogTitle>
				Delete category:{" "}
				<span className="font-medium italic">{category.name}</span>{" "}
			</DialogTitle>
			<DialogDescription>
				Are you sure you want to delete this category?
			</DialogDescription>
			<DialogFooter>
				<Button variant="outline" onClick={() => setIsOpen(false)}>
					Cancel
				</Button>
				<Button variant="destructive" onClick={onDelete}>
					Delete
				</Button>
			</DialogFooter>
		</WrapperDialogVaul>
	);
};
