import { pgTable, text, timestamp, uuid, boolean, integer, index } from 'drizzle-orm/pg-core';

// Selah - Faith-based prayer and worship app schema

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  displayName: text('display_name'), // Name used in personalized prayers
  avatarUrl: text('avatar_url'),
  trialStartDate: timestamp('trial_start_date'), // 3-day free trial
  trialEndDate: timestamp('trial_end_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(),
  tier: text('tier').notNull(), // monthly, yearly, trial
  status: text('status').default('active').notNull(), // active, cancelled, expired, trial
  dodoSubscriptionId: text('dodo_subscription_id'),
  creditsRemaining: integer('credits_remaining').default(0).notNull(),
  renewsAt: timestamp('renews_at'),
  lastAudioGeneratedAt: timestamp('last_audio_generated_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  userIdIdx: index('subscriptions_user_id_idx').on(table.userId),
}));

export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  amount: text('amount').notNull(),
  currency: text('currency').notNull(),
  status: text('status').notNull(),
  dodoData: text('dodo_data').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('transactions_user_id_idx').on(table.userId),
}));

// Prayers table - stores generated personalized prayers
export const prayers = pgTable('prayers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  userName: text('user_name').notNull(), // Name used in prayer (for personalization)
  need: text('need').notNull(), // peace, strength, guidance, healing, gratitude, comfort
  message: text('message'), // Optional user message (max 120 chars)
  prayerText: text('prayer_text').notNull(), // Generated prayer text
  audioUrl: text('audio_url'), // TTS audio URL (premium feature)
  isFavorite: boolean('is_favorite').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('prayers_user_id_idx').on(table.userId),
  createdAtIdx: index('prayers_created_at_idx').on(table.createdAt),
}));



// Daily Bible Verses - stores the 365 pre-selected KJV verses
export const bibleVerses = pgTable('bible_verses', {
  id: uuid('id').primaryKey().defaultRandom(),
  dayOfYear: integer('day_of_year').notNull().unique(), // 1-365
  reference: text('reference').notNull(), // e.g., "John 3:16"
  verseText: text('verse_text').notNull(), // Full verse text
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  dayOfYearIdx: index('bible_verses_day_of_year_idx').on(table.dayOfYear),
}));

// Export TypeScript helper types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

export type Prayer = typeof prayers.$inferSelect;
export type InsertPrayer = typeof prayers.$inferInsert;



export type BibleVerse = typeof bibleVerses.$inferSelect;
export type InsertBibleVerse = typeof bibleVerses.$inferInsert;

// Selah-specific types
export type PrayerNeedType = 'peace' | 'strength' | 'guidance' | 'healing' | 'gratitude' | 'comfort';
