import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { EditCreateForm } from "~/components/admin/users/edit-create-form";
import { Button } from "~/components/ui/button";
import { DialogTitle } from "~/components/ui/dialog";
import { WrapperDialogVaul } from "~/components/ui/vaul-dialog";

export const CreateUserDialog = () => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<WrapperDialogVaul
			isOpen={isOpen}
			setIsOpen={setIsOpen}
			trigger={
				<Button>
					<PlusIcon size={20} />
					<span>Add new</span>
				</Button>
			}
		>
			<DialogTitle>Create User</DialogTitle>
			<EditCreateForm onFinished={() => setIsOpen(false)} />
		</WrapperDialogVaul>
	);
};
