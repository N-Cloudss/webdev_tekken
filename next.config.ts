import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  serverExternalPackages: ['jose', 'jwks-rsa', 'firebase-admin'],
};

export default nextConfig;
