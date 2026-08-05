import {
  sqliteTable,
  text,
  integer,
  real,
  primaryKey,
  index,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'

/**
 * Column keys are deliberately snake_case so `typeof products.$inferSelect` is
 * structurally identical to the Product shape the whole UI already renders.
 * Timestamps are ISO-8601 strings, prices are plain floats in EUR.
 */

export const categories = sqliteTable('categories', {
  slug: text('slug').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  sort_order: integer('sort_order').notNull().default(999),
})

export const products = sqliteTable(
  'products',
  {
    // ASIN. Kept as the primary key so every existing /product/<ASIN> URL survives.
    id: text('id').primaryKey(),
    external_id: text('external_id').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    seo_description: text('seo_description'),
    // 'ai' when written by scripts/ai-descriptions.mjs, 'template' for the offline
    // fallback, null for scraped/imported copy. Drives the "KI-generiert" hint.
    description_source: text('description_source'),
    price: real('price').notNull(),
    original_price: real('original_price'),
    affiliate_url: text('affiliate_url').notNull(),
    image_url: text('image_url'),
    category: text('category').references(() => categories.slug, { onDelete: 'set null' }),
    brand: text('brand'),
    rating: real('rating'),
    review_count: integer('review_count').notNull().default(0),
    created_at: text('created_at').notNull(),
    updated_at: text('updated_at').notNull(),
  },
  (t) => [
    uniqueIndex('products_external_id_idx').on(t.external_id),
    index('products_category_idx').on(t.category),
    index('products_price_idx').on(t.price),
    index('products_original_price_idx').on(t.original_price),
  ]
)

/** Precomputed recommendations (TF-IDF content similarity, optionally LLM-reranked). */
export const productSimilarity = sqliteTable(
  'product_similarity',
  {
    product_id: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    related_id: text('related_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    score: real('score').notNull(),
    reason: text('reason'),
    source: text('source').notNull().default('content'),
    created_at: text('created_at').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.product_id, t.related_id] }),
    index('similarity_product_score_idx').on(t.product_id, t.score),
  ]
)

// ---------------------------------------------------------------------------
// Auth.js (DrizzleAdapter shape) + our own extras on `users`
// ---------------------------------------------------------------------------

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
  image: text('image'),
  // Own fields (credentials provider + member perks)
  password_hash: text('password_hash'),
  role: text('role').notNull().default('user'),
  newsletter_opt_in: integer('newsletter_opt_in', { mode: 'boolean' }).notNull().default(false),
  created_at: text('created_at').notNull(),
})

export const accounts = sqliteTable(
  'accounts',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })]
)

export const sessions = sqliteTable('sessions', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
})

export const verificationTokens = sqliteTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })]
)

// ---------------------------------------------------------------------------
// Shop features
// ---------------------------------------------------------------------------

export const favourites = sqliteTable(
  'favourites',
  {
    user_id: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    product_id: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    created_at: text('created_at').notNull(),
  },
  (t) => [primaryKey({ columns: [t.user_id, t.product_id] })]
)

export const newsletterSubscribers = sqliteTable(
  'newsletter_subscribers',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    /** 'pending' until the double-opt-in link is clicked, then 'confirmed' | 'unsubscribed'. */
    status: text('status').notNull().default('pending'),
    token: text('token').notNull(),
    user_id: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    created_at: text('created_at').notNull(),
    confirmed_at: text('confirmed_at'),
    unsubscribed_at: text('unsubscribed_at'),
  },
  (t) => [index('newsletter_token_idx').on(t.token)]
)

export const discountCodes = sqliteTable('discount_codes', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  /** Free text, e.g. "15 %" or "10 €" — we are an affiliate shop, there is no own checkout. */
  value_label: text('value_label').notNull(),
  /** 'member' codes require a login, 'public' ones are shown to everyone. */
  audience: text('audience').notNull().default('member'),
  valid_until: text('valid_until'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  created_at: text('created_at').notNull(),
})

export const discountRedemptions = sqliteTable(
  'discount_redemptions',
  {
    user_id: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    code_id: text('code_id')
      .notNull()
      .references(() => discountCodes.id, { onDelete: 'cascade' }),
    revealed_at: text('revealed_at').notNull(),
  },
  (t) => [primaryKey({ columns: [t.user_id, t.code_id] })]
)

export const contactMessages = sqliteTable('contact_messages', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject'),
  message: text('message').notNull(),
  created_at: text('created_at').notNull(),
})

// ---------------------------------------------------------------------------
// First-party analytics (replaces Google Analytics) + CAC inputs
// ---------------------------------------------------------------------------

export const events = sqliteTable(
  'events',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    /** 'pageview' | 'click' (affiliate outbound) | 'search' */
    type: text('type').notNull(),
    product_id: text('product_id'),
    category: text('category'),
    path: text('path'),
    /** Placement the click came from: card | detail | ad-skyscraper | rail | … */
    src: text('src'),
    session_id: text('session_id').notNull(),
    user_id: text('user_id'),
    created_at: text('created_at').notNull(),
  },
  (t) => [
    index('events_type_created_idx').on(t.type, t.created_at),
    index('events_product_idx').on(t.product_id),
    index('events_session_created_idx').on(t.session_id, t.created_at),
  ]
)

export const adSpend = sqliteTable(
  'ad_spend',
  {
    id: text('id').primaryKey(),
    /** YYYY-MM-DD */
    day: text('day').notNull(),
    channel: text('channel').notNull(),
    amount_eur: real('amount_eur').notNull(),
    note: text('note'),
    created_at: text('created_at').notNull(),
  },
  (t) => [index('ad_spend_day_idx').on(t.day)]
)

export const syncRuns = sqliteTable('sync_runs', {
  id: text('id').primaryKey(),
  source: text('source').notNull(),
  started_at: text('started_at').notNull(),
  finished_at: text('finished_at'),
  products_upserted: integer('products_upserted').notNull().default(0),
  api_calls: integer('api_calls').notNull().default(0),
  rate_limit_remaining: integer('rate_limit_remaining'),
  status: text('status').notNull(),
  error: text('error'),
})

export type Product = typeof products.$inferSelect
export type Category = typeof categories.$inferSelect
export type User = typeof users.$inferSelect
export type DiscountCode = typeof discountCodes.$inferSelect
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect
export type AdSpend = typeof adSpend.$inferSelect
