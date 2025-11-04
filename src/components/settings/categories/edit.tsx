import { EditIcon } from "lucide-react";
import { useState } from "react";
import { EditCreateForm } from "~/components/settings/categories/edit-create-form";
import { Button } from "~/components/ui/button";
import { WrapperDialogVaul } from "~/components/ui/vaul-dialog";
import type { RouterOutputs } from "~/trpc/react";

type Props = {
	category: RouterOutputs["category"]["getAll"][number];
};

export const EditCategoryDialog = ({ category }: Props) => {
	const [isOpen, setIsOpen] = useState(false);
	return (
		<WrapperDialogVaul isOpen={isOpen} setIsOpen={setIsOpen}>
			<WrapperDialogVaul.Trigger>
				<Button variant="ghost" className="w-8" size="icon">
					<EditIcon size={20} />
				</Button>
			</WrapperDialogVaul.Trigger>
			<WrapperDialogVaul.Title>Edit Category</WrapperDialogVaul.Title>
			<EditCreateForm onFinished={() => setIsOpen(false)} category={category} />
		</WrapperDialogVaul>
	);
};
