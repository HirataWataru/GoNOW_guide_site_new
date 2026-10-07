"use client";

import { useRef } from "react";
import { Icon } from "./icons";

/**
 * 本文の画像。画面に収まる大きさで表示し、クリックすると原寸に近い大きさで拡大表示する。
 * 操作画面のスクリーンショットや書類のサンプルなど、細部を見たい画像のため。
 */
export function ZoomableImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="group relative mx-auto block cursor-zoom-in rounded-lg"
        aria-label={`${alt}（クリックで拡大）`}
      >
        {/* Notion・Canva から書き出した画像はサイズがまちまちなため next/image ではなく img を使う */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={`mx-auto block h-auto max-h-[min(70vh,560px)] w-auto max-w-full rounded-lg border border-line bg-white object-contain ${className}`}
        />
        <span className="absolute right-2 bottom-2 flex items-center gap-1 rounded-full bg-navy/80 px-2.5 py-1 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <Icon name="search" size={12} strokeWidth={4} />
          拡大
        </span>
      </button>

      <dialog
        ref={dialog}
        aria-label={alt}
        onClick={(e) => {
          // 画像の外側（背景）をクリックしたら閉じる
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        className="m-auto max-h-[95vh] max-w-[95vw] overflow-auto rounded-xl bg-white p-0 shadow-2xl backdrop:bg-navy/70"
      >
        <div className="sticky top-0 flex justify-end bg-white/90 p-2">
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="flex items-center gap-1 rounded-full bg-navy px-3 py-1.5 text-sm font-bold text-white hover:bg-brand-ink"
          >
            <Icon name="close" size={14} strokeWidth={4} />
            閉じる
          </button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="block h-auto max-w-none px-3 pb-3" style={{ width: "min(1200px, 92vw)" }} />
      </dialog>
    </>
  );
}
