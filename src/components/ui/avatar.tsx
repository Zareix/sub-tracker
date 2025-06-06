"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import type * as React from "react";

import { cn } from "~/lib/utils";

const Avatar = ({
	className,
	...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) => (
	<AvatarPrimitive.Root
		data-slot="avatar-root"
		className={cn(
			"relative flex size-10 shrink-0 overflow-hidden rounded-full",
			className,
		)}
		{...props}
	/>
);

const AvatarImage = ({
	className,
	...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) => (
	<AvatarPrimitive.Image
		data-slot="avatar-image"
		className={cn("aspect-square h-full w-full", className)}
		{...props}
	/>
);

const AvatarFallback = ({
	className,
	...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) => (
	<AvatarPrimitive.Fallback
		data-slot="avatar-fallback"
		className={cn(
			"flex h-full w-full items-center justify-center rounded-full bg-muted",
			className,
		)}
		{...props}
	/>
);

export { Avatar, AvatarImage, AvatarFallback };
