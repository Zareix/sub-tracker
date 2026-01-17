import "./src/env.js";
import withBundleAnalyzer from "@next/bundle-analyzer";
import createNextIntlPlugin from "next-intl/plugin";

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
			{
				protocol: "https",
				hostname: "cdn.jsdelivr.net",
				pathname: "/gh/homarr-labs/dashboard-icons/**",
			},
		],
		localPatterns: [
			{
				pathname: "/api/files",
			},
		],
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
};

const withNextIntl = createNextIntlPlugin({
	experimental: {
		createMessagesDeclaration: "./src/i18n/messages/en.json",
	},
});
export default withBundleAnalyzer({
	enabled: process.env.ANALYZE === "true",
})(withNextIntl(config));
