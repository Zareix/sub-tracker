import { TrashIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "~/components/ui/dialog";
import { WrapperDialogVaul } from "~/components/ui/vaul-dialog";
import type { User } from "~/server/db/schema";
import { api } from "~/utils/api";

export const DeleteUserDialog = ({
  user,
}: {
  user: Pick<User, "id" | "name">;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const session = useSession();
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
    <WrapperDialogVaul
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      trigger={
        <Button
          variant="ghost"
          className="w-8 text-destructive"
          size="icon"
          disabled={session.data?.user.id === user?.id}
        >
          <TrashIcon size={20} />
        </Button>
      }
    >
      <DialogTitle>
        Delete user:{" "}
        <span className="font-medium italic">{user.name}</span>{" "}
      </DialogTitle>
      <DialogDescription>
        Are you sure you want to delete user this user?
      </DialogDescription>
      <DialogFooter>
        <Button variant="secondary" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onDelete}>
          Delete
        </Button>
      </DialogFooter>
    </WrapperDialogVaul>
  );
};
