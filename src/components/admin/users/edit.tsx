import { EditIcon } from "lucide-react";
import { useState } from "react";
import { EditCreateForm } from "~/components/admin/users/edit-create-form";
import { Button } from "~/components/ui/button";
import { WrapperDialogVaul } from "~/components/ui/vaul-dialog";
import type { RouterOutputs } from "~/utils/api";

type Props = {
	user: RouterOutputs["user"]["getAll"][number];
};

export const EditUserDialog = ({ user }: Props) => {
	const [isOpen, setIsOpen] = useState(false);
	return (
		<WrapperDialogVaul
			isOpen={isOpen}
			setIsOpen={setIsOpen}
			trigger={
				<Button variant="ghost" className="w-8" size="icon">
					<EditIcon size={20} />
				</Button>
			}
			title="Edit User"
		>
			<EditCreateForm onFinished={() => setIsOpen(false)} user={user} />
		</WrapperDialogVaul>
	);
};
