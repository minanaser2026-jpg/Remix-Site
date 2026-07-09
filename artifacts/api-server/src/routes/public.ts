import { Router } from "express";
import { db } from "@workspace/db";
import { siteContentTable, socialLinksTable, reelsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router = Router();

// GET /api/content — flat {key: value} object for the public frontend
router.get("/content", async (_req, res) => {
  try {
    const items = await db.select().from(siteContentTable);
    const out: Record<string, string> = {};
    items.forEach((i) => { out[i.key] = i.value; });
    res.json(out);
  } catch {
    res.json({});
  }
});

// GET /api/social-links — visible links ordered by orderIndex
router.get("/social-links", async (_req, res) => {
  try {
    const links = await db
      .select()
      .from(socialLinksTable)
      .where(eq(socialLinksTable.visible, true))
      .orderBy(asc(socialLinksTable.orderIndex));
    res.json(links);
  } catch {
    res.json([]);
  }
});

// GET /api/reels — visible reels ordered by orderIndex
router.get("/reels", async (_req, res) => {
  try {
    const reels = await db
      .select()
      .from(reelsTable)
      .where(eq(reelsTable.visible, true))
      .orderBy(asc(reelsTable.orderIndex));
    res.json(
      reels.map((r) => ({
        id: String(r.id),
        title: r.title,
        thumbnailUrl: r.thumbnailUrl,
        permalinkUrl: r.permalinkUrl,
        duration: r.duration,
        createdTime: r.fbCreatedTime ?? "",
      }))
    );
  } catch {
    res.json([]);
  }
});

export default router;
