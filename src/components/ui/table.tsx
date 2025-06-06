import type * as React from "react";

import { cn } from "~/lib/utils";

const Table = ({ className, ...props }: React.ComponentProps<"table">) => (
	<div className="relative w-full overflow-auto rounded-md border">
		<table
			className={cn("w-full caption-bottom text-sm", className)}
			{...props}
		/>
	</div>
);

const TableHeader = ({
	className,
	...props
}: React.ComponentProps<"thead">) => (
	<thead className={cn("bg-muted [&_tr]:border-b", className)} {...props} />
);

const TableBody = ({ className, ...props }: React.ComponentProps<"tbody">) => (
	<tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
);

const TableFooter = ({
	className,
	...props
}: React.ComponentProps<"tfoot">) => (
	<tfoot
		className={cn(
			"border-t bg-muted/50 font-medium last:[&>tr]:border-b-0",
			className,
		)}
		{...props}
	/>
);

const TableRow = ({ className, ...props }: React.ComponentProps<"tr">) => (
	<tr
		className={cn(
			"border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
			className,
		)}
		{...props}
	/>
);

const TableHead = ({ className, ...props }: React.ComponentProps<"th">) => (
	<th
		className={cn(
			"h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
			className,
		)}
		{...props}
	/>
);

const TableCell = ({ className, ...props }: React.ComponentProps<"td">) => (
	<td
		className={cn(
			"overflow-clip text-ellipsis p-4 align-middle [&:has([role=checkbox])]:pr-0",
			className,
		)}
		{...props}
	/>
);

const TableCaption = ({
	className,
	...props
}: React.ComponentProps<"caption">) => (
	<caption
		className={cn("mt-4 text-muted-foreground text-sm", className)}
		{...props}
	/>
);

export {
	Table,
	TableHeader,
	TableBody,
	TableFooter,
	TableHead,
	TableRow,
	TableCell,
	TableCaption,
};
