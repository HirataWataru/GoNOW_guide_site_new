import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { CONTENT_TAG } from "@/lib/content";

// Notion を更新したときにサイトへ即時反映するためのエンドポイント。
// Notion のオートメーション（Webhook 送信）や手動の curl から呼ぶ:
//   POST /api/revalidate  ヘッダー x-revalidate-secret: <REVALIDATE_SECRET>

function authorized(given: string | null) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  if (!authorized(req.headers.get("x-revalidate-secret"))) {
    return Response.json({ ok: false }, { status: 401 });
  }
  revalidateTag(CONTENT_TAG, "max");
  revalidatePath("/", "layout");
  return Response.json({ ok: true, revalidatedAt: new Date().toISOString() });
}
