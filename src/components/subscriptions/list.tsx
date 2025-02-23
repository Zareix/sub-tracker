import { parseAsJson, parseAsStringEnum, useQueryState } from "nuqs";
import { filtersSchema } from "~/lib/constant";
import { api, type RouterOutputs } from "~/utils/api";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  EditIcon,
  EllipsisVertical,
  RefreshCcwIcon,
  TextIcon,
  TrashIcon,
  UserIcon,
} from "lucide-react";
import {
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "~/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { WrapperDialogVaul } from "~/components/ui/vaul-dialog";
import { Card, CardContent } from "~/components/ui/card";
import { SORTS } from "~/lib/constant";
import { getFilteredSubscriptions, getSortedSubscriptions } from "~/lib/utils";
import Image from "next/image";
import { EditSubscriptionDialog } from "~/components/subscriptions/edit";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

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
  const [sort] = useQueryState(
    "sort",
    parseAsStringEnum(SORTS.map((s) => s.key)),
  );

  const subs = getFilteredSubscriptions(
    getSortedSubscriptions(subscriptions, sort),
    filters,
  );

  return (
    <>
      <Accordion type="single" collapsible>
        {subs.map((subscription) => (
          <SubscriptionListItem
            key={subscription.id}
            subscription={subscription}
          />
        ))}
      </Accordion>
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
    edit: false,
  });
  return (
    <Card key={subscription.id} className="mt-3">
      <CardContent>
        <AccordionItem value={subscription.id.toString()}>
          <AccordionTrigger asChild>
            <div className="flex items-center gap-2">
              {subscription.image && (
                <Image
                  src={subscription.image}
                  alt={subscription.name}
                  width={64}
                  height={40}
                  className="max-h-[40px] object-contain"
                />
              )}
              <h2 className="flex-grow text-xl font-semibold">
                {subscription.name}
              </h2>
              <div className="hidden items-center gap-1 text-muted-foreground md:flex">
                <UserIcon size={18} />
                <span>{subscription.users.map((u) => u.name).join(", ")}</span>
              </div>
              <p className="hidden items-center gap-1 text-muted-foreground md:flex">
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
                    onClick={() =>
                      setIsOpen({
                        ...isOpen,
                        delete: true,
                      })
                    }
                  >
                    <TrashIcon />
                    <span>Delete</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsOpen({ ...isOpen, edit: true })}
                  >
                    <EditIcon />
                    <span>Edit</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DeleteDialog
                subscription={subscription}
                isOpen={isOpen.delete}
                setIsOpen={() => setIsOpen({ ...isOpen, delete: false })}
              />
              <EditSubscriptionDialog
                subscription={subscription}
                isOpen={isOpen.edit}
                setIsOpen={() => setIsOpen({ ...isOpen, edit: false })}
              />
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="mt-2 grid grid-cols-2 gap-1 text-base">
              <div className="flex items-center gap-2 md:hidden">
                <UserIcon size={18} />
                <span>{subscription.users.map((u) => u.name).join(", ")}</span>
              </div>
              <div className="flex items-center gap-2 md:hidden">
                <RefreshCcwIcon size={16} />
                {subscription.schedule}
              </div>
              <div className="flex items-center gap-2">
                <TextIcon size={20} />
                <span>{subscription.description}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
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
