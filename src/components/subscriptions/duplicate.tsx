import { useTranslations } from "next-intl";
import { EditCreateForm } from "~/components/subscriptions/edit-create-form";
import { WrapperDialogVaul } from "~/components/ui/vaul-dialog";
import type { RouterOutputs } from "~/trpc/react";

type Props = {
	subscription: Omit<RouterOutputs["subscription"]["getAll"][number], "id"> & {
		id?: number;
	};
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const DuplicateSubscriptionDialog = ({
	subscription,
	isOpen,
	setIsOpen,
}: Props) => {
	const t = useTranslations("SubscriptionForm");

	return (
		<WrapperDialogVaul isOpen={isOpen} setIsOpen={setIsOpen}>
			<WrapperDialogVaul.Title>
				{t("duplicate.title", { name: subscription.name })}
			</WrapperDialogVaul.Title>
			<EditCreateForm
				onFinished={() => {
					setIsOpen(false);
				}}
				subscription={{
					...subscription,
					id: undefined,
				}}
			/>
		</WrapperDialogVaul>
	);
};
