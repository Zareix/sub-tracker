import { TrashIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { WrapperDialogVaul } from "~/components/ui/vaul-dialog";
import { authClient } from "~/lib/auth-client";
import type { User } from "~/server/db/schema";
import { api } from "~/trpc/react";

export const DeleteUserDialog = ({
	user,
}: {
	user: Pick<User, "id" | "name">;
}) => {
	const t = useTranslations("AdminPage");
	const tCommon = useTranslations("Common");
	const [isOpen, setIsOpen] = useState(false);
	const session = authClient.useSession();
	const apiUtils = api.useUtils();
	const deleteUserMutation = api.user.delete.useMutation({
		onSuccess: () => {
			toast.success(t("userDeleted"));
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
				{t("deleteUser")}:{" "}
				<span className="font-medium italic">{user.name}</span>
			</WrapperDialogVaul.Title>
			<WrapperDialogVaul.Description>
				{t("deleteUserConfirm")}
			</WrapperDialogVaul.Description>
			<WrapperDialogVaul.Footer>
				<Button variant="outline" onClick={() => setIsOpen(false)}>
					{tCommon("cancel")}
				</Button>
				<Button variant="destructive" onClick={onDelete}>
					{tCommon("delete")}
				</Button>
			</WrapperDialogVaul.Footer>
		</WrapperDialogVaul>
	);
};
