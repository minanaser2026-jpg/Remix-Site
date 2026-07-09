import { pgTable, serial, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core';

// Admin users
export const adminUsersTable = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Site content (key-value pairs for editable text / image URLs)
export const siteContentTable = pgTable('site_content', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull().default(''),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Social media links
export const socialLinksTable = pgTable('social_links', {
  id: serial('id').primaryKey(),
  platform: text('platform').notNull(),
  label: text('label').notNull(),
  url: text('url').notNull(),
  icon: text('icon').notNull().default(''),
  color: text('color').notNull().default('#ffffff'),
  orderIndex: integer('order_index').notNull().default(0),
  visible: boolean('visible').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Reels / videos
export const reelsTable = pgTable('reels', {
  id: serial('id').primaryKey(),
  fbVideoId: text('fb_video_id').notNull().unique(),
  title: text('title'),
  description: text('description'),
  thumbnailUrl: text('thumbnail_url'),
  permalinkUrl: text('permalink_url').notNull(),
  duration: integer('duration'),
  fbCreatedTime: text('fb_created_time'),
  visible: boolean('visible').notNull().default(true),
  orderIndex: integer('order_index').notNull().default(0),
  syncedAt: timestamp('synced_at').defaultNow().notNull(),
});

export type AdminUser = typeof adminUsersTable.$inferSelect;
export type SiteContent = typeof siteContentTable.$inferSelect;
export type SocialLink = typeof socialLinksTable.$inferSelect;
export type Reel = typeof reelsTable.$inferSelect;
