import { cva, type VariantProps } from "class-variance-authority";
import { Spinner } from "~/components/ui/spinner";
import { cn } from "~/lib/utils";

const spinnerVariants = cva("m-auto text-primary", {
	variants: {
		size: {
			default: "size-6",
			xs: "size-3",
			sm: "size-4",
			lg: "size-8",
			xl: "size-10",
		},
	},
	defaultVariants: {
		size: "default",
	},
});

export const Loading = ({
	size,
	className,
	...props
}: React.ComponentProps<"div"> & VariantProps<typeof spinnerVariants>) => {
	return (
		<div
			{...props}
			className={cn(
				"flex h-full w-full items-center justify-center",
				className,
			)}
		>
			<Spinner className={spinnerVariants({ size })} />
		</div>
	);
};
