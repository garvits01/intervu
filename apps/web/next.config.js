/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@haveloc/ui", "@haveloc/db"],
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;
