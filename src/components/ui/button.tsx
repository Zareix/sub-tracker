import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";

import { LoaderCircleIcon } from "lucide-react";
import { cn } from "~/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				//default: "bg-primary text-primary-foreground hover:bg-primary/90",
				default:
					"border border-zinc-900/25 bg-linear-to-t from-primary to-primary/85 text-primary-foreground shadow-md shadow-zinc-900/20 ring-1 ring-white/20 ring-inset transition-[filter] duration-200 hover:brightness-110 active:brightness-90 dark:border-white/20 dark:ring-transparent",
				// destructive:
				//   "bg-destructive text-destructive-foreground hover:bg-destructive/90",
				destructive:
					"border border-zinc-900/25 bg-linear-to-t from-destructive to-destructive/85 text-destructive-foreground shadow-md shadow-zinc-900/20 ring-1 ring-white/20 ring-inset transition-[filter] duration-200 hover:brightness-110 active:brightness-90 dark:border-white/15 dark:ring-transparent",
				"outline-t":
					"border border-input bg-background hover:bg-accent hover:text-accent-foreground",
				outline:
					"border border-border bg-linear-to-t from-muted to-background shadow-2xs shadow-zinc-900/10 duration-200 hover:to-muted dark:border-border dark:from-muted/50",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary/80",
				ghost: "hover:bg-accent hover:text-accent-foreground",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-8 px-3 py-1.5",
				sm: "h-9 rounded-md px-3",
				lg: "h-11 rounded-md px-8",
				icon: "h-9 w-8",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	isLoading?: boolean;
}

export const Button = ({
	className,
	variant,
	size,
	asChild = false,
	isLoading = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
		isLoading?: boolean;
	}) => {
	const Comp = asChild ? Slot : "button";
	if (isLoading) {
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				disabled
				{...props}
			>
				<LoaderCircleIcon className="animate-spin" />
			</Comp>
		);
	}
	return (
		<Comp
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
};

export { buttonVariants };
