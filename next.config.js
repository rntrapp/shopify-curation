/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['rntrassemblylabelimages.blob.core.windows.net']
  }
};

module.exports = nextConfig; 