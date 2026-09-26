import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', 
  devIndicators: false,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;