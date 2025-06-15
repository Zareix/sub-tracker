import { useMutation } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import { api } from "~/utils/api";

export const ImageSearch = ({
	query,
	setFileUrl,
}: {
	query: string;
	setFileUrl: (url: string) => void;
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const searchImagesQuery = api.subscription.searchImages.useQuery(
		{
			query,
		},
		{
			enabled: false,
		},
	);
	const uploadFileMutation = useMutation({
		mutationFn: async (imageUrl: string) => {
			const formData = new FormData();
			formData.append("imageUrl", imageUrl);
			const response = await fetch("/api/files", {
				method: "POST",
				body: formData,
			});
			const data = (await response.json()) as
				| { url: string }
				| { error: string };
			if (!response.ok) {
				throw new Error(
					`Failed to upload file${"error" in data ? data.error : ""}`,
				);
			}
			return data;
		},
		onSuccess: (data) => {
			if ("url" in data) {
				setFileUrl(data.url);
				setIsOpen(false);
			} else {
				toast.error(data.error);
			}
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
	const searchImage = () => {
		if (!query) {
			toast.error("Please enter a name to search for images");
			return;
		}
		searchImagesQuery.refetch();
	};

	const selectImage = (imageLink: string) => {
		uploadFileMutation.mutate(imageLink);
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					size="icon"
					variant="ghost"
					className="group hover:bg-transparent"
					onClick={searchImage}
				>
					<SearchIcon className="size-8 group-hover:text-primary" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" className="relative grid grid-cols-4 gap-2">
				{searchImagesQuery.data?.map((image) => (
					<Button
						key={image.imageLink}
						type="button"
						variant="ghost"
						onClick={() => selectImage(image.imageLink)}
						className="h-full w-full"
					>
						<Image
							src={image.thumbnailLink}
							alt={image.title}
							width={64}
							height={70}
							className="max-h-[70px] max-w-[64px] object-contain "
						/>
					</Button>
				))}
				{searchImagesQuery.isLoading && (
					<div className="col-span-4">Loading images...</div>
				)}
				{searchImagesQuery.isError && (
					<div className="col-span-4">Error fetching images</div>
				)}
				{uploadFileMutation.isPending && (
					<div className="fade-in-0 absolute inset-0 flex animate-in items-center justify-center bg-white/50 backdrop-blur-xs backdrop-saturate-150">
						Uploading image...
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
};
