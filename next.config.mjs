/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Suppress missing optional native modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@react-native-async-storage/async-storage": false,
      "pino-pretty": false,
      lokijs: false,
      encoding: false,
    };
    return config;
  },
};

export default nextConfig;
