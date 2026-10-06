import type { SVGProps } from "react";

// 矢印・検索・閉じるなど小さな UI 用の SVG アイコン。
// カテゴリなどのイラストは Canva の原本（illustration.tsx）を使う。

const paths = {
  contract: (
    <>
      <path d="M12 6h18l8 8v28H12z" />
      <path d="M30 6v8h8M18 22h14M18 28h14M18 34h8" />
      <path d="M30 40l10-10 3 3-10 10h-3z" />
    </>
  ),
  sensor: (
    <>
      <rect x="17" y="6" width="14" height="10" rx="2" />
      <path d="M21 6v10M27 6v10" />
      <rect x="14" y="16" width="20" height="5" rx="1.5" />
      <rect x="15" y="21" width="18" height="5" rx="1.5" />
      <path d="M6 30h36v12H6z" />
    </>
  ),
  laptop: (
    <>
      <rect x="9" y="12" width="30" height="20" rx="2" />
      <path d="M4 38h40l-3-6H7z" />
      <path d="M30 8a5 5 0 0 1 9 2 4 4 0 0 1 0 8h-9a4 4 0 0 1 0-8" />
    </>
  ),
  training: (
    <>
      <circle cx="14" cy="16" r="6" />
      <path d="M4 40c0-7 4-12 10-12s10 5 10 12" />
      <rect x="24" y="8" width="20" height="16" rx="1.5" />
      <path d="M20 28l10-8" />
    </>
  ),
  truck: (
    <>
      <path d="M4 32V18h10l5 6v8" />
      <rect x="19" y="14" width="25" height="14" rx="7" />
      <path d="M4 32h40" />
      <circle cx="12" cy="36" r="3.5" />
      <circle cx="32" cy="36" r="3.5" />
      <circle cx="40" cy="36" r="3.5" />
    </>
  ),
  support: (
    <>
      <circle cx="24" cy="18" r="8" />
      <path d="M12 18a12 12 0 0 1 24 0v4M12 22v-4" />
      <rect x="9" y="18" width="5" height="8" rx="2" />
      <rect x="34" y="18" width="5" height="8" rx="2" />
      <path d="M36 26c0 4-4 6-8 6M10 44c0-8 6-12 14-12s14 4 14 12" />
    </>
  ),
  form: (
    <>
      <rect x="10" y="8" width="26" height="34" rx="2" />
      <path d="M17 5h12v6H17zM16 20l3 3 5-6M16 31l3 3 5-6M28 21h4M28 32h4" />
    </>
  ),
  document: (
    <>
      <path d="M12 6h18l8 8v28H12z" />
      <path d="M30 6v8h8M18 22h14M18 28h14M18 34h14" />
    </>
  ),
  subsidy: (
    <>
      <path d="M14 6h16l8 8v12M14 6v14" />
      <path d="M30 6v8h8M20 16l4 5 6-8" />
      <ellipse cx="16" cy="30" rx="9" ry="3" />
      <path d="M7 30v8c0 1.7 4 3 9 3s9-1.3 9-3v-8" />
      <circle cx="35" cy="36" r="8" />
      <path d="M32 32l3 4 3-4M35 36v5M32 38h6" />
    </>
  ),
  folder: (
    <>
      <path d="M5 14h14l4 4h20v22H5z" />
      <path d="M13 10h20l4 8" />
    </>
  ),
  shield: (
    <>
      <path d="M24 5l16 6v11c0 10-7 17-16 21-9-4-16-11-16-21V11z" />
      <path d="M17 24l5 5 9-10" />
    </>
  ),
  building: (
    <>
      <rect x="11" y="5" width="26" height="38" rx="2" />
      <path d="M17 12h2M23 12h2M29 12h2M17 19h2M23 19h2M29 19h2M17 26h2M23 26h2M29 26h2M20 43v-8a4 4 0 0 1 8 0v8" />
    </>
  ),
  news: (
    <>
      <path d="M8 18v12h6l14 8V10L14 18z" />
      <path d="M34 18a8 8 0 0 1 0 12M38 13a14 14 0 0 1 0 22" />
    </>
  ),
  tips: (
    <>
      <path d="M17 30a12 12 0 1 1 14 0v5H17z" />
      <path d="M19 40h10M21 44h6" />
    </>
  ),
  signal: (
    <>
      <circle cx="24" cy="20" r="3" />
      <path d="M24 23v20M17 13a10 10 0 0 0 0 14M31 13a10 10 0 0 1 0 14M11 8a17 17 0 0 0 0 24M37 8a17 17 0 0 1 0 24" />
    </>
  ),
  gear: (
    <>
      <circle cx="24" cy="24" r="6" />
      <path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.6 10.6l4.2 4.2M33.2 33.2l4.2 4.2M10.6 37.4l4.2-4.2M33.2 14.8l4.2-4.2" />
      <circle cx="24" cy="24" r="13" />
    </>
  ),
  search: (
    <>
      <circle cx="21" cy="21" r="13" />
      <path d="M31 31l11 11" />
    </>
  ),
  arrowRight: <path d="M8 24h32M28 12l12 12-12 12" />,
  chevronDown: <path d="M12 18l12 12 12-12" />,
  external: (
    <>
      <path d="M26 8h14v14M40 8L22 26" />
      <path d="M34 28v12H8V14h12" />
    </>
  ),
  download: <path d="M24 6v24M14 20l10 10 10-10M8 40h32" />,
  clock: (
    <>
      <circle cx="24" cy="24" r="18" />
      <path d="M24 13v11l7 5" />
    </>
  ),
  menu: <path d="M8 12h32M8 24h32M8 36h32" />,
  close: <path d="M12 12l24 24M36 12L12 36" />,
  video: (
    <>
      <rect x="5" y="11" width="38" height="26" rx="5" />
      <path d="M20 18l10 6-10 6z" />
    </>
  ),
  mail: (
    <>
      <rect x="5" y="10" width="38" height="28" rx="3" />
      <path d="M5 13l19 14 19-14" />
    </>
  ),
} as const;

export type IconName = keyof typeof paths;

export function Icon({
  name,
  size = 24,
  strokeWidth = 3,
  ...rest
}: { name: IconName; size?: number; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
