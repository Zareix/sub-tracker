import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { WrapperDialogVaul } from "~/components/ui/vaul-dialog";
import { api, type RouterOutputs } from "~/utils/api";

export const DeleteDialog = ({
	subscription,
	isOpen,
	setIsOpen,
}: {
	subscription: Pick<
		RouterOutputs["subscription"]["getAll"][number],
		"id" | "name"
	>;
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
			<WrapperDialogVaul.Title>
				Delete subscription:{" "}
				<span className="font-medium italic">{subscription.name}</span>
			</WrapperDialogVaul.Title>
			<WrapperDialogVaul.Description>
				Are you sure you want to delete subscription this subscription?
			</WrapperDialogVaul.Description>
			<WrapperDialogVaul.Footer>
				<Button
					variant="destructive"
					onClick={onDelete}
					isLoading={deleteSubscriptionMutation.isPending}
				>
					Delete
				</Button>
				<Button
					variant="outline"
					onClick={() => setIsOpen(false)}
					disabled={deleteSubscriptionMutation.isPending}
				>
					Cancel
				</Button>
			</WrapperDialogVaul.Footer>
		</WrapperDialogVaul>
	);
};
