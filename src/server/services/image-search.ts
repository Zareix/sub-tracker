import { TRPCError } from "@trpc/server";
import { env } from "~/env";

export type SearchImageResult = {
	title: string;
	imageLink: string;
	thumbnailLink: string;
	thumbnailHeight: number;
	thumbnailWidth: number;
};

type GoogleSearchResponse = {
	items: Array<{
		title: string;
		htmlTitle: string;
		link: string;
		displayLink: string;
		snippet: string;
		htmlSnippet: string;
		mime: string;
		fileFormat: string;
		image: {
			contextLink: string;
			height: number;
			width: number;
			byteSize: number;
			thumbnailLink: string;
			thumbnailHeight: number;
			thumbnailWidth: number;
		};
	}>;
};

const searchGoogle = async (query: string) => {
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

type SVGLResponse = Array<{
	id: number;
	title: string;
	category: string | string[];
	route:
		| string
		| {
				dark: string;
				light: string;
		  };
	url: string;
	wordmark?:
		| string
		| {
				dark: string;
				light: string;
		  };
	brandUrl?: string;
}>;

const searchSvgl = async (query: string) => {
	const searchParams = new URLSearchParams({
		search: query,
	});
	const response = await fetch(
		`https://api.svgl.app?${searchParams.toString()}`,
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
			message: "Error fetching images from Svgl API",
		});
	}
	const data = (await response.json()) as SVGLResponse;
	const results = [] as SearchImageResult[];
	for (const item of data) {
		if (typeof item.route === "string") {
			results.push({
				title: item.title,
				imageLink: item.route,
				thumbnailLink: item.route,
				thumbnailHeight: 128,
				thumbnailWidth: 128,
			});
			continue;
		}
		results.push({
			title: item.title,
			imageLink: item.route.light,
			thumbnailLink: item.route.light,
			thumbnailHeight: 128,
			thumbnailWidth: 128,
		});
		results.push({
			title: item.title,
			imageLink: item.route.dark,
			thumbnailLink: item.route.dark,
			thumbnailHeight: 128,
			thumbnailWidth: 128,
		});
	}
	return results;
};

export const searchImages = async (query: string) => {
	const [svgl, google] = await Promise.allSettled([
		searchSvgl(query),
		searchGoogle(query),
	]);

	const results = [] as SearchImageResult[];
	if (svgl.status === "fulfilled") {
		results.push(...svgl.value);
	}
	if (google.status === "fulfilled") {
		results.push(...google.value);
	}

	return results;
};
