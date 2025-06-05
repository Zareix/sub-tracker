import { TRPCError } from "@trpc/server";
import { env } from "~/env";

type GoogleSearchResponse = {
	items: Item[];
};

type Item = {
	title: string;
	htmlTitle: string;
	link: string;
	displayLink: string;
	snippet: string;
	htmlSnippet: string;
	mime: string;
	fileFormat: string;
	image: Image;
};

type Image = {
	contextLink: string;
	height: number;
	width: number;
	byteSize: number;
	thumbnailLink: string;
	thumbnailHeight: number;
	thumbnailWidth: number;
};

export const searchImages = async (query: string) => {
	if (!env.GOOGLE_SEARCH_ID || !env.GOOGLE_SEARCH_KEY) {
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Google Search API credentials are not set",
		});
	}
	const searchParams = new URLSearchParams({
		q: query,
		cx: env.GOOGLE_SEARCH_ID,
		key: env.GOOGLE_SEARCH_KEY,
		searchType: "image",
	});
	const response = await fetch(
		`https://www.googleapis.com/customsearch/v1?${searchParams.toString()}`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		},
	);
	if (!response.ok) {
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Error fetching images from Google Search API",
		});
	}
	const data = (await response.json()) as GoogleSearchResponse;
	return data.items.map((item) => ({
		title: item.title,
		imageLink: item.link,
		thumbnailLink: item.image.thumbnailLink,
		thumbnailHeight: item.image.thumbnailHeight,
		thumbnailWidth: item.image.thumbnailWidth,
	}));
};
