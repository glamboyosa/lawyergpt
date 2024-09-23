import createJiti from "jiti";
const jiti = createJiti(fileURLToPath(import.meta.url));

// Import env here to validate during build. Using jiti we can import .ts files :)
jiti("./app/lib/env");
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
