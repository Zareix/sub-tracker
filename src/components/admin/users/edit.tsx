import { EditIcon } from "lucide-react";
import { useState } from "react";
import { EditCreateForm } from "~/components/admin/users/edit-create-form";
import { Button } from "~/components/ui/button";
import { WrapperDialogVaul } from "~/components/ui/vaul-dialog";
import { authClient } from "~/lib/auth-client";

type Props = {
	user: Parameters<typeof EditCreateForm>["0"]["user"];
};

export const EditUserDialog = ({ user }: Props) => {
	const [isOpen, setIsOpen] = useState(false);
	const session = authClient.useSession();

	return (
		<WrapperDialogVaul isOpen={isOpen} setIsOpen={setIsOpen}>
			<WrapperDialogVaul.Trigger>
				<Button
					variant="ghost"
					className="w-8"
					size="icon"
					disabled={session.data?.user.id === user?.id}
				>
					<EditIcon size={20} />
				</Button>
			</WrapperDialogVaul.Trigger>
			<WrapperDialogVaul.Title>Edit User</WrapperDialogVaul.Title>
			<EditCreateForm onFinished={() => setIsOpen(false)} user={user} />
		</WrapperDialogVaul>
	);
};
