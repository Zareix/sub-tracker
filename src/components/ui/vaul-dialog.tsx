import type * as DialogPrimitive from "@radix-ui/react-dialog";
import React, { ReactNode, type HtmlHTMLAttributes } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerTitle,
	DrawerTrigger,
} from "~/components/ui/drawer";
import { useIsMobile } from "~/lib/hooks/use-mobile";

export const createWrapper = <
	T extends React.ElementType,
	U extends React.ElementType,
>() => {
	return ({
		children,
		...props
	}: React.ComponentProps<T> &
		React.ComponentProps<U> &
		HtmlHTMLAttributes<HTMLDivElement>) => {
		if (React.isValidElement(children)) {
			return React.cloneElement(children as React.ReactElement, { ...props });
		}
		return <>{children}</>;
	};
};

export const WrapperDialogVaulTitle = createWrapper<
	typeof DialogTitle,
	typeof DrawerTitle
>();

export const WrapperDialogVaulTrigger = createWrapper<
	typeof DialogTrigger,
	typeof DrawerTrigger
>();

export const WrapperDialogVaulDescription = createWrapper<
	typeof DialogDescription,
	typeof DrawerDescription
>();

export const WrapperDialogVaulFooter = createWrapper<
	typeof DialogFooter,
	typeof DrawerFooter
>();

export const WrapperDialogVaul = ({
	children,
	isOpen,
	setIsOpen,
}: {
	children: React.ReactNode;
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const isMobile = useIsMobile();

	const content = React.Children.toArray(children).filter(
		(child) =>
			React.isValidElement(child) &&
			child.type !== WrapperDialogVaulTitle &&
			child.type !== WrapperDialogVaulTrigger &&
			child.type !== WrapperDialogVaulDescription &&
			child.type !== WrapperDialogVaulFooter,
	)[0];
	const title = React.Children.toArray(children).filter(
		(child) =>
			React.isValidElement(child) && child.type === WrapperDialogVaulTitle,
	)[0] as React.ReactElement<typeof WrapperDialogVaulTitle>;
	const trigger = React.Children.toArray(children).filter(
		(child) =>
			React.isValidElement(child) && child.type === WrapperDialogVaulTrigger,
	)[0] as React.ReactElement<typeof WrapperDialogVaulTrigger>;
	const description = React.Children.toArray(children).filter(
		(child) =>
			React.isValidElement(child) &&
			child.type === WrapperDialogVaulDescription,
	)[0] as React.ReactElement<typeof WrapperDialogVaulDescription>;
	const footer = React.Children.toArray(children).filter(
		(child) =>
			React.isValidElement(child) && child.type === WrapperDialogVaulFooter,
	)[0] as React.ReactElement<typeof WrapperDialogVaulFooter>;

	if (isMobile) {
		return (
			<>
				<Drawer open={isOpen} onOpenChange={setIsOpen} repositionInputs={false}>
					{trigger && (
						<DrawerTrigger asChild {...trigger.props}>
							{trigger}
						</DrawerTrigger>
					)}
					<DrawerContent>
						{title && <DrawerTitle {...title.props}>{title}</DrawerTitle>}
						{content}
						{description && (
							<DrawerDescription {...description.props}>
								{description}
							</DrawerDescription>
						)}
						{footer && <DrawerFooter {...footer.props}>{footer}</DrawerFooter>}
					</DrawerContent>
				</Drawer>
			</>
		);
	}
	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			{trigger && (
				<DialogTrigger asChild {...trigger.props}>
					{trigger}
				</DialogTrigger>
			)}
			<DialogContent>
				{title && <DialogTitle {...title.props}>{title}</DialogTitle>}
				{content}
				{description && (
					<DialogDescription {...description.props}>
						{description}
					</DialogDescription>
				)}
				{footer && <DialogFooter {...footer.props}>{footer}</DialogFooter>}
			</DialogContent>
		</Dialog>
	);
};

WrapperDialogVaul.Title = WrapperDialogVaulTitle;
WrapperDialogVaul.Trigger = WrapperDialogVaulTrigger;
WrapperDialogVaul.Description = WrapperDialogVaulDescription;
WrapperDialogVaul.Footer = WrapperDialogVaulFooter;
