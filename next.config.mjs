/** @type {import('next').NextConfig} */
const nextConfig = {
  images:{
    remotePatterns:[
      {
        hostname:'intent-swan-456.convex.cloud',
      }
    ]
  }
};

export default nextConfig;
