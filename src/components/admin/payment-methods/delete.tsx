import { TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "~/components/ui/dialog";
import { WrapperDialogVaul } from "~/components/ui/vaul-dialog";
import type { PaymentMethod } from "~/server/db/schema";
import { api } from "~/utils/api";

export const DeletePaymentMethodDialog = ({
  paymentMethod,
}: {
  paymentMethod: Pick<PaymentMethod, "id" | "name">;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const apiUtils = api.useUtils();
  const deletePaymentMethodMutation = api.paymentMethod.delete.useMutation({
    onSuccess: () => {
      toast.success("PaymentMethod deleted!");
      apiUtils.paymentMethod.getAll.invalidate().catch(console.error);
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function onDelete() {
    deletePaymentMethodMutation.mutate(paymentMethod.id);
  }

  return (
    <WrapperDialogVaul
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      trigger={
        <Button variant="ghost" className="w-8 text-destructive" size="icon">
          <TrashIcon size={20} />
        </Button>
      }
    >
      <DialogTitle>
        Delete payment method:{" "}
        <span className="font-medium italic">{paymentMethod.name}</span>{" "}
      </DialogTitle>
      <DialogDescription>
        Are you sure you want to delete paymentMethod this payment method?
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
