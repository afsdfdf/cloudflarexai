/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'www.logofacade.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '*.ave-api.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'www.iconaves.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'cryptologos.cc',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '**',
      },
    ],
  },
  experimental: {
    webVitalsAttribution: ['CLS', 'LCP'],
  },
  webpack: (config, { isServer }) => {
    // 优化客户端构建
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            default: false,
            vendors: false,
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                const match = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
                if (!match) return 'vendor';
                const packageName = match[1];
                return `npm.${packageName.replace('@', '')}`;
              },
            },
          },
        },
      };
    }
    return config;
  },
}

export default nextConfig
