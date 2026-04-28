import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const configFilePath = fileURLToPath(import.meta.url);
const projectRoot = path.dirname(configFilePath);

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
