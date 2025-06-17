import { TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { WrapperDialogVaul } from "~/components/ui/vaul-dialog";
import { authClient } from "~/lib/auth-client";
import type { User } from "~/server/db/schema";
import { api } from "~/utils/api";

export const DeleteUserDialog = ({
	user,
}: {
	user: Pick<User, "id" | "name">;
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const session = authClient.useSession();
	const apiUtils = api.useUtils();
	const deleteUserMutation = api.user.delete.useMutation({
		onSuccess: () => {
			toast.success("User deleted!");
			apiUtils.user.getAll.invalidate().catch(console.error);
			setIsOpen(false);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	function onDelete() {
		deleteUserMutation.mutate(user.id);
	}

	return (
		<WrapperDialogVaul isOpen={isOpen} setIsOpen={setIsOpen}>
			<WrapperDialogVaul.Trigger>
				<Button
					variant="ghost"
					className="w-8 text-destructive"
					size="icon"
					disabled={session.data?.user.id === user?.id}
				>
					<TrashIcon size={20} />
				</Button>
			</WrapperDialogVaul.Trigger>
			<WrapperDialogVaul.Title>
				Delete user: <span className="font-medium italic">{user.name}</span>
			</WrapperDialogVaul.Title>
			<WrapperDialogVaul.Description>
				Are you sure you want to delete user this user?
			</WrapperDialogVaul.Description>
			<WrapperDialogVaul.Footer>
				<Button variant="outline" onClick={() => setIsOpen(false)}>
					Cancel
				</Button>
				<Button variant="destructive" onClick={onDelete}>
					Delete
				</Button>
			</WrapperDialogVaul.Footer>
		</WrapperDialogVaul>
	);
};
