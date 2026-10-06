import Image from "next/image";

// Canva「デザイン引き継ぎ」の PDF から書き出した線画（public/illustrations）。
// 濃紺の線画なので、青い面の上では白いタイルに載せて使う。
export const ILLUSTRATIONS = [
  "gonow-logo", "zerospec-logo", "attachment-ring", "sensor-signal", "tank-side", "tank-box", "sensor-measure",
  "laptop-cloud", "gonow-tablet", "tank-stand", "tank-large", "tank-sensor", "click", "tanker-truck", "gas-station",
  "building", "arrow-curve", "no-rain", "refresh", "no-snow", "no-crush", "no-paint", "no-dirt", "no-power",
  "operator", "person", "consultation", "training", "operator-blue", "person-blue", "antenna", "contract",
  "folder-docs", "checklist", "warehouse", "apartment", "tools", "gears", "battery", "barcode", "office", "cost",
  "flow", "chart", "team", "badge", "shield", "prohibited", "mountain",
] as const;

export type IllustrationName = (typeof ILLUSTRATIONS)[number];

export function Illustration({
  name,
  size = 48,
  alt = "",
  className = "",
}: {
  name: IllustrationName;
  size?: number;
  alt?: string;
  className?: string;
}) {
  return (
    <Image
      src={`/illustrations/${name}.png`}
      alt={alt}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/** 青い面の上に載せるための白いタイル */
export function IllustrationTile({ name, size = 48, className = "" }: { name: IllustrationName; size?: number; className?: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-2xl bg-white p-2.5 ${className}`}>
      <Illustration name={name} size={size} />
    </span>
  );
}
