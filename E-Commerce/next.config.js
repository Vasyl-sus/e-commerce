const config = require('./config/environment')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = withBundleAnalyzer({
 //compress: true,


  webpack: (config, { isServer }) => {
    config.resolve.fallback = { crypto: false } // Fix OpenSSL errors

   if (!isServer) {
     config.resolve.alias['@sentry/node'] = '@sentry/browser'
    }

    return config 
  },

  env: {
    PUBLIC_KEY_STRIPE: config.stripe.public_key,
  },

  sassOptions: {
    includePaths: [`${process.cwd()}/static/css/global.scss`], // Ensure folder path is correct
  },

  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },

 images: {
   domains: ['E-Commerce.com', 'cdn.E-Commerce.com', 'localhost'], // Add your image domains here
  },

  reactStrictMode: true,
})

module.exports = nextConfig
