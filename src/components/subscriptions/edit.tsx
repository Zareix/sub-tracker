import { EditCreateForm } from "~/components/subscriptions/edit-create-form";
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
			<WrapperDialogVaul.Title>
				Edit Subscription: {subscription.name}
			</WrapperDialogVaul.Title>
			<EditCreateForm
				onFinished={() => {
					setIsOpen(false);
				}}
				subscription={subscription}
			/>
		</WrapperDialogVaul>
	);
};
