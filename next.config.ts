import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 記事の Markdown はサーバーで読むので、デプロイ先のサーバーにも同梱する
  outputFileTracingIncludes: {
    "/**": ["./content/**/*.md"],
  },
};

export default nextConfig;
