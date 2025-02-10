/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',  // Required for static site generation
    images: {
        domains: ['link.storjshare.io'],
        unoptimized: true, // Required for static export
    },
    basePath: '/Lusher', // Updated to match your new repository name
}

module.exports = nextConfig