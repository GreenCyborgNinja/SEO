/** @type {import('next').NextConfig} */
const nextConfig = {
  // better-sqlite3 is a native module: it must stay outside the bundle, otherwise
  // the bundler tries to inline the .node binary and the build fails.
  serverExternalPackages: ['better-sqlite3'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: 'images-eu.ssl-images-amazon.com' },
      { protocol: 'https', hostname: 'images-na.ssl-images-amazon.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

module.exports = nextConfig
