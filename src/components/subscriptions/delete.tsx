import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { WrapperDialogVaul } from "~/components/ui/vaul-dialog";
import { api, type RouterOutputs } from "~/trpc/react";

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
	const t = useTranslations("SubscriptionForm");
	const tCommon = useTranslations("Common");
	const apiUtils = api.useUtils();
	const deleteSubscriptionMutation = api.subscription.delete.useMutation({
		onSuccess: () => {
			toast.success(t("delete.success"));
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
				{t("delete.title")}{" "}
				<span className="font-medium italic">{subscription.name}</span>
			</WrapperDialogVaul.Title>
			<WrapperDialogVaul.Description>
				{t("delete.confirm")}
			</WrapperDialogVaul.Description>
			<WrapperDialogVaul.Footer>
				<Button
					variant="destructive"
					onClick={onDelete}
					isLoading={deleteSubscriptionMutation.isPending}
				>
					{tCommon("actions.delete")}
				</Button>
				<Button
					variant="outline"
					onClick={() => setIsOpen(false)}
					disabled={deleteSubscriptionMutation.isPending}
				>
					{tCommon("actions.cancel")}
				</Button>
			</WrapperDialogVaul.Footer>
		</WrapperDialogVaul>
	);
};
