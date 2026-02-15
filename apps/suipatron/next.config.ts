import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Handle WASM files for Walrus SDK
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Add rule for .wasm files
    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
    });

    // Exclude WASM from server bundle to avoid SSR issues
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        "@mysten/walrus-wasm": "commonjs @mysten/walrus-wasm",
      });
    }

    return config;
  },
};

export default nextConfig;
