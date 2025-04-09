/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Disable static optimization to ensure API routes are always available
  // Important for serverless functions in Vercel
  trailingSlash: false,
  
  // Configure rewrites to ensure API requests are correctly routed in development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'development' 
          ? 'http://localhost:3001/api/:path*' // dev API server
          : '/api/:path*' // in production, Vercel will handle this
      }
    ];
  }
};

module.exports = nextConfig; 