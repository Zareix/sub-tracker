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
};

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(config);
