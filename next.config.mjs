/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false, // 禁用 SWC 压缩以尝试避开 SWC 权限问题
};

export default nextConfig;
