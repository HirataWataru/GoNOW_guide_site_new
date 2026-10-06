import { unstable_cache } from "next/cache";
import { getAllArticles } from "@/lib/content";
import { fetchFreshFileUrl, isNotionConfigured } from "@/lib/content/notion";

// Notion の署名付き URL は発行から1時間で失効する。50分だけ使い回し、それ以降は取り直す。
const freshUrl = unstable_cache(
  async (blockId: string) => {
    const ids = new Set((await getAllArticles()).map((a) => a.id));
    return fetchFreshFileUrl(blockId, ids);
  },
  ["notion-file-url"],
  { revalidate: 50 * 60 },
);

const UUID = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

export async function GET(_req: Request, ctx: RouteContext<"/api/notion-file/[blockId]">) {
  const { blockId } = await ctx.params;
  if (!isNotionConfigured() || !UUID.test(blockId)) return new Response("Not found", { status: 404 });

  const url = await freshUrl(blockId).catch(() => null);
  if (!url) return new Response("Not found", { status: 404 });

  return new Response(null, {
    status: 307,
    headers: { Location: url, "Cache-Control": "public, max-age=600" },
  });
}
