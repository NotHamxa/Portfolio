/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },
    images: {
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.public.blob.vercel-storage.com',
            },
        ],
    },

    webpack(config) {
        config.module.rules.push({
            test: /\.txt$/,
            use: 'raw-loader',
        })
        return config
    },
    turbopack: {
        // ...
    },
}

export default nextConfig
