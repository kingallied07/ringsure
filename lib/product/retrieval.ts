import { listKnowledge } from "./store";
import type { KnowledgeChunk } from "./store";

/** Tenant-scoped retrieval. The caller MUST pass a trusted tenantId from a signed call context. */
export async function retrieveKnowledge(tenantId: string, query: string, max = 3) {
  const terms = query.toLowerCase().split(/\s+/).filter((word) => word.length > 2);

  // Filter first, then score. No global search, no post-filtering.
  const scoped = (await listKnowledge(tenantId)).filter((item) => item.tenantId === tenantId);

  const ranked = scoped
    .map((chunk) => {
      const haystack = `${chunk.title} ${chunk.content}`.toLowerCase();
      const score = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
      return { chunk, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max);

  const safe: KnowledgeChunk[] = ranked.filter(({ chunk }) => chunk.tenantId === tenantId).map(({ chunk }) => chunk);

  return {
    chunks: safe.map((chunk) => ({ title: chunk.title, content: chunk.content, kind: chunk.kind })),
    assertionFailed: safe.length !== ranked.length,
  };
}
