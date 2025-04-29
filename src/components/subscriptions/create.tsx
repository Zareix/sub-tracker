import { useState } from "react";
import { EditCreateForm } from "~/components/subscriptions/edit-create-form";
import { WrapperDialogVaul } from "~/components/ui/vaul-dialog";

export const CreateSubscriptionDialog = ({
	trigger,
}: {
	trigger?: React.ReactNode;
}) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<WrapperDialogVaul
			isOpen={isOpen}
			setIsOpen={setIsOpen}
			trigger={trigger}
			title="Create Subscription"
		>
			<EditCreateForm onFinished={() => setIsOpen(false)} />
		</WrapperDialogVaul>
	);
};
