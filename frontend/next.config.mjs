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
    transpilePackages: [
        '@deck.gl/layers',
        '@deck.gl/react',
        '@deck.gl/aggregation-layers',
        'three',
        '@react-three/fiber',
        '@react-three/drei'
    ],
    images: {
        unoptimized: true
    },
    async rewrites() {
      const backend = process.env.BACKEND_URL || 'http://localhost:8005';
      return [
        {
          source: '/ai-penteter/:path*',
          destination: 'http://ai-pentest:9100/:path*',
        },
        {
          source: '/raptor/:path*',
          destination: `${backend}/api/raptor/:path*`,
        },
      ]
    }
};

export default nextConfig;
