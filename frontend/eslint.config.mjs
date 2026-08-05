import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

const config = [
  { ignores: ['.next/**', 'node_modules/**', 'drizzle/**', 'next-env.d.ts'] },
  ...nextCoreWebVitals,
  {
    rules: {
      // Ad creatives intentionally use plain <img> so banners stay lazy and
      // unoptimized; next/image is used everywhere it actually pays off.
      '@next/next/no-img-element': 'off',
    },
  },
]

export default config
