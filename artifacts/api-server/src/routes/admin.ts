import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, pool } from "@workspace/db";
import {
  adminUsersTable,
  siteContentTable,
  socialLinksTable,
  reelsTable,
} from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";

declare module "express-session" {
  interface SessionData {
    userId: number;
    username: string;
  }
}

const router = Router();

// ── Auth middleware ────────────────────────────────────────────────────────────
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

// ── Setup (first admin only) ───────────────────────────────────────────────────
router.post("/admin/setup", async (req: Request, res: Response) => {
  try {
    const existing = await db.select().from(adminUsersTable).limit(1);
    if (existing.length > 0) {
      res.status(403).json({ error: "Admin already exists. Use login." });
      return;
    }
    const { username, password } = req.body as { username: string; password: string };
    if (!username || !password || password.length < 6) {
      res.status(400).json({ error: "Username and password (min 6 chars) required" });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(adminUsersTable).values({ username, passwordHash }).returning();
    req.session.userId = user.id;
    req.session.username = user.username;
    res.json({ ok: true, username: user.username });
  } catch (err) {
    console.error("[admin/setup] error:", err);
    res.status(500).json({ error: "Server error", detail: String(err) });
  }
});

// ── Login ───────────────────────────────────────────────────────────────────────
router.post("/admin/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body as { username: string; password: string };
    const [user] = await db
      .select()
      .from(adminUsersTable)
      .where(eq(adminUsersTable.username, username));
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }
    req.session.userId = user.id;
    req.session.username = user.username;
    res.json({ ok: true, username: user.username });
  } catch (err) {
    console.error("[admin/login] error:", err);
    res.status(500).json({ error: "Server error", detail: String(err) });
  }
});

// ── Logout ──────────────────────────────────────────────────────────────────────
router.post("/admin/logout", (req: Request, res: Response) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// ── Me ──────────────────────────────────────────────────────────────────────────
router.get("/admin/me", requireAuth, (req: Request, res: Response) => {
  res.json({ userId: req.session.userId, username: req.session.username });
});

// ── Content ─────────────────────────────────────────────────────────────────────
router.get("/admin/content", requireAuth, async (_req: Request, res: Response) => {
  const items = await db.select().from(siteContentTable).orderBy(asc(siteContentTable.key));
  res.json(items);
});

router.put("/admin/content", requireAuth, async (req: Request, res: Response) => {
  const { key, value } = req.body as { key: string; value: string };
  if (!key) { res.status(400).json({ error: "key required" }); return; }
  const existing = await db.select().from(siteContentTable).where(eq(siteContentTable.key, key));
  if (existing.length > 0) {
    const [updated] = await db
      .update(siteContentTable)
      .set({ value: value ?? "", updatedAt: new Date() })
      .where(eq(siteContentTable.key, key))
      .returning();
    res.json(updated);
  } else {
    const [created] = await db
      .insert(siteContentTable)
      .values({ key, value: value ?? "" })
      .returning();
    res.json(created);
  }
});

// ── Social Links ─────────────────────────────────────────────────────────────────
router.get("/admin/social-links", requireAuth, async (_req: Request, res: Response) => {
  const links = await db.select().from(socialLinksTable).orderBy(asc(socialLinksTable.orderIndex));
  res.json(links);
});

router.post("/admin/social-links", requireAuth, async (req: Request, res: Response) => {
  const { platform, label, url, icon, color, orderIndex, visible } = req.body;
  if (!platform || !url) { res.status(400).json({ error: "platform and url required" }); return; }
  const [created] = await db.insert(socialLinksTable).values({
    platform, label: label || platform, url,
    icon: icon || "", color: color || "#ffffff",
    orderIndex: orderIndex ?? 0, visible: visible !== false,
  }).returning();
  res.json(created);
});

router.put("/admin/social-links/:id", requireAuth, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { platform, label, url, icon, color, orderIndex, visible } = req.body;
  const [updated] = await db.update(socialLinksTable)
    .set({ platform, label, url, icon, color, orderIndex, visible })
    .where(eq(socialLinksTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

router.delete("/admin/social-links/:id", requireAuth, async (req: Request, res: Response) => {
  await db.delete(socialLinksTable).where(eq(socialLinksTable.id, Number(req.params.id)));
  res.json({ ok: true });
});

// ── Reels ─────────────────────────────────────────────────────────────────────
router.get("/admin/reels", requireAuth, async (_req: Request, res: Response) => {
  const reels = await db.select().from(reelsTable).orderBy(asc(reelsTable.orderIndex));
  res.json(reels);
});

router.put("/admin/reels/:id", requireAuth, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { visible, orderIndex, title } = req.body;
  const update: Partial<typeof reelsTable.$inferInsert> = {};
  if (visible !== undefined) update.visible = visible;
  if (orderIndex !== undefined) update.orderIndex = orderIndex;
  if (title !== undefined) update.title = title;
  const [updated] = await db.update(reelsTable).set(update)
    .where(eq(reelsTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

// Sync reels from Facebook
router.post("/admin/reels/sync", requireAuth, async (_req: Request, res: Response) => {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID || "me";
  if (!token) {
    res.status(400).json({ error: "FACEBOOK_PAGE_ACCESS_TOKEN not configured in environment" });
    return;
  }

  type FbVideo = {
    id: string; title?: string; description?: string;
    thumbnails?: { data: Array<{ uri: string }> };
    permalink_url: string; length?: number; created_time?: string;
  };

  // Fetch all pages from a Facebook Graph API endpoint
  async function fetchAllPages(initialUrl: string): Promise<FbVideo[]> {
    const results: FbVideo[] = [];
    let nextUrl: string | null = initialUrl;
    while (nextUrl) {
      const res = await fetch(nextUrl);
      const data = await res.json() as { data?: FbVideo[]; paging?: { next?: string }; error?: { message: string } };
      if (data.error) throw new Error(data.error.message);
      if (data.data) results.push(...data.data);
      nextUrl = data.paging?.next ?? null;
    }
    return results;
  }

  try {
    const fields = "id,title,description,thumbnails,permalink_url,length,created_time";
    let videos: FbVideo[] = [];

    // Try reels endpoint first (newer API)
    const reelsUrl = `https://graph.facebook.com/v19.0/${pageId}/reels?fields=${fields}&limit=100&access_token=${token}`;
    const reelsRes = await fetch(reelsUrl);
    const reelsData = await reelsRes.json() as { data?: FbVideo[]; paging?: { next?: string }; error?: { message: string } };

    if (reelsData.data && reelsData.data.length > 0) {
      // Reels endpoint returned results — fetch all pages
      videos = await fetchAllPages(reelsUrl);
    } else {
      // Fallback: fetch all uploaded videos (Reels show up here too)
      const videosUrl = `https://graph.facebook.com/v19.0/${pageId}/videos?type=uploaded&fields=${fields}&limit=100&access_token=${token}`;
      videos = await fetchAllPages(videosUrl);
    }

    let synced = 0;
    for (const v of videos) {
      const thumbnail = v.thumbnails?.data?.[0]?.uri ?? null;
      await db.insert(reelsTable).values({
        fbVideoId: v.id,
        title: v.title ?? null,
        description: v.description ?? null,
        thumbnailUrl: thumbnail,
        permalinkUrl: v.permalink_url,
        duration: v.length ? Math.round(v.length) : null,
        fbCreatedTime: v.created_time ?? null,
        visible: true,
        orderIndex: synced,
        syncedAt: new Date(),
      }).onConflictDoUpdate({
        target: reelsTable.fbVideoId,
        set: {
          title: v.title ?? null,
          thumbnailUrl: thumbnail,
          duration: v.length ? Math.round(v.length) : null,
          syncedAt: new Date(),
        },
      });
      synced++;
    }
    const total = await db.select().from(reelsTable);
    res.json({ ok: true, synced, total: total.length });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ── Change password ────────────────────────────────────────────────────────────
router.post("/admin/change-password", requireAuth, async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
  if (!newPassword || newPassword.length < 8) {
    res.status(400).json({ error: "New password must be at least 8 characters" });
    return;
  }
  const [user] = await db.select().from(adminUsersTable)
    .where(eq(adminUsersTable.id, req.session.userId!));
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    res.status(401).json({ error: "Current password is incorrect" });
    return;
  }
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.update(adminUsersTable).set({ passwordHash })
    .where(eq(adminUsersTable.id, user.id));
  res.json({ ok: true });
});

export default router;
