import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerTitle,
	DrawerTrigger,
} from "~/components/ui/drawer";
import { useIsMobile } from "~/lib/hooks/use-mobile";

export const WrapperDialogVaul = ({
	trigger,
	children,
	isOpen,
	setIsOpen,
	title,
}: {
	trigger?: React.ReactNode;
	children: React.ReactNode;
	title: React.ReactNode;
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const isMobile = useIsMobile();
	if (isMobile) {
		return (
			<>
				<Drawer open={isOpen} onOpenChange={setIsOpen} repositionInputs={false}>
					{trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
					<DrawerContent>
						<DrawerTitle>{title}</DrawerTitle>
						{children}
					</DrawerContent>
				</Drawer>
			</>
		);
	}
	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			{trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
			<DialogContent>
				<DialogTitle>{title}</DialogTitle>
				{children}
			</DialogContent>
		</Dialog>
	);
};
