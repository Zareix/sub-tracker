import { DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { WrapperDialogVaul } from "~/components/ui/vaul-dialog";
import { EditCreateForm } from "~/components/admin/users/edit-create-form";

export const CreateUserDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <WrapperDialogVaul
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      trigger={<Button>Add new</Button>}
    >
      <DialogTitle>Create User</DialogTitle>
      <EditCreateForm onFinished={() => setIsOpen(false)} />
    </WrapperDialogVaul>
  );
};
