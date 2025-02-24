import { DialogTitle } from "~/components/ui/dialog";
import { useState } from "react";
import { WrapperDialogVaul } from "~/components/ui/vaul-dialog";
import { EditCreateForm } from "~/components/subscriptions/edit-create-form";

export const CreateSubscriptionDialog = ({
  trigger,
}: {
  trigger?: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <WrapperDialogVaul isOpen={isOpen} setIsOpen={setIsOpen} trigger={trigger}>
      <DialogTitle>Create Subscription</DialogTitle>
      <EditCreateForm onFinished={() => setIsOpen(false)} />
    </WrapperDialogVaul>
  );
};
