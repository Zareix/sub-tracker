import { EditIcon } from "lucide-react";
import { useState } from "react";
import { EditCreateForm } from "~/components/admin/payment-methods/edit-create-form";
import { Button } from "~/components/ui/button";
import { WrapperDialogVaul } from "~/components/ui/vaul-dialog";
import type { RouterOutputs } from "~/utils/api";

type Props = {
	paymentMethod: RouterOutputs["paymentMethod"]["getAll"][number];
};

export const EditPaymentMethodDialog = ({ paymentMethod }: Props) => {
	const [isOpen, setIsOpen] = useState(false);
	return (
		<WrapperDialogVaul
			isOpen={isOpen}
			setIsOpen={setIsOpen}
			trigger={
				<Button variant="ghost" className="w-8" size="icon">
					<EditIcon size={20} />
				</Button>
			}
			title="Edit Payment method"
		>
			<EditCreateForm
				onFinished={() => setIsOpen(false)}
				paymentMethod={paymentMethod}
			/>
		</WrapperDialogVaul>
	);
};
