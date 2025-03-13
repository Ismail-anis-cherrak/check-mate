import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};
module.exports = {
  env: {
    DB_LINK: process.env.DB_LINK,
  },
};


export default nextConfig;
