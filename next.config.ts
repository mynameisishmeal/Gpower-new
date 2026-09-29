import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    'mongoose',
    'mongodb',
    'pdf-to-printer',
    'dotenv',
    'bcryptjs'
  ],
};

export default nextConfig;
