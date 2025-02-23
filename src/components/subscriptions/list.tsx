import { parseAsJson, useQueryState } from "nuqs";
import { filtersSchema } from "~/server/api/routers/schema";
import { api, type RouterOutputs } from "~/utils/api";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  EllipsisVertical,
  RefreshCcwIcon,
  TrashIcon,
  UserIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { WrapperDialogVaul } from "~/components/ui/vaul-dialog";
import { Card, CardContent } from "~/components/ui/card";

type Props = {
  subscriptions: RouterOutputs["subscription"]["getAll"];
};

export const SubscriptionList = ({ subscriptions }: Props) => {
  const [filters] = useQueryState("filters", {
    ...parseAsJson(filtersSchema.parse),
    defaultValue: {
      schedule: null,
      paymentMethodId: null,
      users: null,
    },
  });

  let filteredSubscriptions = subscriptions;
  if (filters.schedule) {
    filteredSubscriptions = filteredSubscriptions.filter(
      (s) => s.schedule === filters.schedule,
    );
  }
  if (filters.paymentMethodId) {
    filteredSubscriptions = filteredSubscriptions.filter(
      (s) => s.paymentMethod.id === filters.paymentMethodId,
    );
  }
  if (filters.users) {
    filteredSubscriptions = filteredSubscriptions.filter((s) =>
      s.users.some((u) => u.id === filters.users),
    );
  }

  return (
    <>
      {filteredSubscriptions.map((subscription) => (
        <SubscriptionListItem
          key={subscription.id}
          subscription={subscription}
        />
      ))}
    </>
  );
};

const SubscriptionListItem = ({
  subscription,
}: {
  subscription: RouterOutputs["subscription"]["getAll"][number];
}) => {
  const [isOpen, setIsOpen] = useState({
    delete: false,
  });
  return (
    <Card key={subscription.id} className="mt-3">
      <CardContent className="flex items-center gap-2">
        <h2 className="flex-grow text-xl font-semibold">{subscription.name}</h2>
        <p className="text-muted-foreground flex items-center gap-1">
          <RefreshCcwIcon size={16} />
          {subscription.schedule}
        </p>
        <p className="text-lg">{subscription.price}€</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <EllipsisVertical size={24} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setIsOpen({ delete: true })}
            >
              <TrashIcon />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DeleteDialog
          subscription={subscription}
          isOpen={isOpen.delete}
          setIsOpen={() => setIsOpen({ delete: false })}
        />
      </CardContent>
    </Card>
  );
};

const DeleteDialog = ({
  subscription,
  isOpen,
  setIsOpen,
}: {
  subscription: RouterOutputs["subscription"]["getAll"][number];
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const apiUtils = api.useUtils();
  const deleteSubscriptionMutation = api.subscription.delete.useMutation({
    onSuccess: () => {
      toast.success("Subscription deleted!");
      apiUtils.subscription.getAll.invalidate().catch(console.error);
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function onDelete() {
    deleteSubscriptionMutation.mutate(subscription.id);
  }

  return (
    <WrapperDialogVaul isOpen={isOpen} setIsOpen={setIsOpen}>
      <DialogTitle>
        Delete subscription:{" "}
        <span className="font-medium italic">{subscription.name}</span>{" "}
      </DialogTitle>
      <DialogDescription>
        Are you sure you want to delete subscription this subscription?
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
