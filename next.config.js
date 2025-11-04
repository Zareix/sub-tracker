import "./src/env.js";
import withBundleAnalyzer from "@next/bundle-analyzer";

/** @type {import("next").NextConfig} */
const config = {
	reactStrictMode: true,

	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**.r2.cloudflarestorage.com",
			},
			{
				protocol: "https",
				hostname: "**.gstatic.com",
			},
		],
		localPatterns: [
			{
				pathname: "/api/files",
			},
		],
	},

	i18n: {
		locales: ["en"],
		defaultLocale: "en",
	},
	transpilePackages: [
		"geist",
		// This should be temporary
		"@better-auth",
		"better-auth",
		"better-call",
		"uncrypto",
		"jose",
	],
	output: "standalone",

	typescript: {
		ignoreBuildErrors: !!process.env.SKIP_LINT,
	},
	eslint: {
		ignoreDuringBuilds: !!process.env.SKIP_LINT,
	},
};

export default withBundleAnalyzer({
	enabled: process.env.ANALYZE === "true",
})(config);
