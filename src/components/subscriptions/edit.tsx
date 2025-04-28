import { EditCreateForm } from "~/components/subscriptions/edit-create-form";
import { DialogTitle } from "~/components/ui/dialog";
import { WrapperDialogVaul } from "~/components/ui/vaul-dialog";
import type { RouterOutputs } from "~/utils/api";

type Props = {
	subscription: RouterOutputs["subscription"]["getAll"][number];
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const EditSubscriptionDialog = ({
	subscription,
	isOpen,
	setIsOpen,
}: Props) => {
	return (
		<WrapperDialogVaul isOpen={isOpen} setIsOpen={setIsOpen}>
			<DialogTitle>Edit Subscription</DialogTitle>
			<EditCreateForm
				onFinished={() => {
					setIsOpen(false);
				}}
				subscription={subscription}
			/>
		</WrapperDialogVaul>
	);
};
