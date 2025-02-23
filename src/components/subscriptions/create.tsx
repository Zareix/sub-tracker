import { DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { WrapperDialogVaul } from "~/components/ui/vaul-dialog";
import { EditCreateForm } from "~/components/subscriptions/edit-create-form";

export const CreateSubscriptionDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <WrapperDialogVaul
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      trigger={
        <Button size="icon" className="size-10 rounded-full shadow-md">
          <PlusIcon size={34} />
        </Button>
      }
    >
      <DialogTitle>Create Subscription</DialogTitle>
      <EditCreateForm onFinished={() => setIsOpen(false)} />
    </WrapperDialogVaul>
  );
};
