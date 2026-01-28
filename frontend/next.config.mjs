/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    reactStrictMode: false,
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    transpilePackages: ['@deck.gl/layers', '@deck.gl/react', '@deck.gl/aggregation-layers'],
    images: {
        unoptimized: true
    }
};

export default nextConfig;
