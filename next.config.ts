import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow external devices on your Wi-Fi and public tunnels to access client JS
  allowedDevOrigins: [
    '10.203.69.4',
    'localhost',
    '*.loca.lt',
    '*.trycloudflare.com',
    '*.pinggy.link',
    '*.ngrok-free.app',
    '*.ngrok.io',
  ],
};

export default nextConfig;
