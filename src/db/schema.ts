import { pgTable, text, timestamp, uuid, boolean, integer, index } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});

export const songs = pgTable('songs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  story: text('story').notNull(),
  style: text('style').notNull(),
  lyrics: text('lyrics'),
  genre: text('genre'),
  mood: text('mood'),
  previewUrl: text('preview_url').notNull(),
  fullUrl: text('full_url').notNull(),
  duration: integer('duration').default(30).notNull(),
  isPurchased: boolean('is_purchased').default(false).notNull(),
  isTemplate: boolean('is_template').default(false).notNull(),
  purchaseTransactionId: text('purchase_transaction_id'),
  userId: text('user_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
  expiresAt: timestamp('expires_at'),
}, (table) => ({
  userIdIdx: index('songs_user_id_idx').on(table.userId),
  isPurchasedIdx: index('songs_is_purchased_idx').on(table.isPurchased),
  isTemplateIdx: index('songs_is_template_idx').on(table.isTemplate),
}));

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(),
  paddleSubscriptionId: text('paddle_subscription_id'),
  tier: text('tier').notNull(),
  status: text('status').default('active').notNull(),
  songsRemaining: integer('songs_remaining').default(0).notNull(),
  renewsAt: timestamp('renews_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  userIdIdx: index('subscriptions_user_id_idx').on(table.userId),
}));

export const templates = pgTable('templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  filename: text('filename').notNull(),
  keywords: text('keywords').notNull(),
  mode: text('mode').notNull(),
  mood: text('mood').notNull(),
  storageUrl: text('storage_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  modeIdx: index('templates_mode_idx').on(table.mode),
}));

export const roasts = pgTable('roasts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id'),
  story: text('story').notNull(),
  mode: text('mode').notNull(),
  title: text('title').notNull(),
  lyrics: text('lyrics'),
  audioUrl: text('audio_url').notNull(),
  isTemplate: boolean('is_template').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('roasts_user_id_idx').on(table.userId),
  createdAtIdx: index('roasts_created_at_idx').on(table.createdAt),
}));

export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  songId: text('song_id'),
  userId: text('user_id'),
  amount: text('amount').notNull(),
  currency: text('currency').notNull(),
  status: text('status').notNull(),
  paddleData: text('paddle_data').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  songIdIdx: index('transactions_song_id_idx').on(table.songId),
  userIdIdx: index('transactions_user_id_idx').on(table.userId),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Song = typeof songs.$inferSelect;
export type InsertSong = typeof songs.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = typeof templates.$inferInsert;

export type Roast = typeof roasts.$inferSelect;
export type InsertRoast = typeof roasts.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;
