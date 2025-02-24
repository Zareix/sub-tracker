import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { EditCreateForm } from "~/components/admin/payment-methods/edit-create-form";
import { Button } from "~/components/ui/button";
import { DialogTitle } from "~/components/ui/dialog";
import { WrapperDialogVaul } from "~/components/ui/vaul-dialog";

export const CreatePaymentMethodDialog = () => {
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
      <DialogTitle>Add Payment method</DialogTitle>
      <EditCreateForm onFinished={() => setIsOpen(false)} />
    </WrapperDialogVaul>
  );
};
