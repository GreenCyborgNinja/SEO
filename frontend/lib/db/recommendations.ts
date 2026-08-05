import 'server-only'

import { and, desc, eq, ne, sql } from 'drizzle-orm'
import { db } from './client'
import { favourites, productSimilarity, products } from './schema'
import { getProductsByIds, type Product } from './products'

/**
 * Recommendations are read-only here: the expensive part (TF-IDF similarity) is
 * precomputed by `npm run ai:similar` into product_similarity, so a page render
 * is a single indexed lookup and never calls an AI API.
 */

/** "Ähnliche Produkte" — precomputed content similarity, with a same-category fallback. */
export async function getRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
  const neighbours = db
    .select({ related_id: productSimilarity.related_id })
    .from(productSimilarity)
    .where(eq(productSimilarity.product_id, productId))
    .orderBy(desc(productSimilarity.score))
    .limit(limit)
    .all()

  if (neighbours.length > 0) {
    return getProductsByIds(neighbours.map((row) => row.related_id))
  }

  // Similarity table not built yet (or a brand-new product): stay useful anyway.
  const self = db.select({ category: products.category }).from(products).where(eq(products.id, productId)).get()
  if (!self?.category) return []

  return db
    .select()
    .from(products)
    .where(and(eq(products.category, self.category), ne(products.id, productId)))
    .orderBy(desc(products.rating), desc(products.review_count))
    .limit(limit)
    .all()
}

/**
 * "Kunden sahen auch an" — co-visitation: products viewed in the same session as
 * this one, ranked by how often that co-occurrence happened. Pure behaviour, no
 * model. Empty until the shop has actual traffic, which is why the content-based
 * rail above exists.
 */
export async function getAlsoViewed(productId: string, limit = 4): Promise<Product[]> {
  const rows = db.all<{ product_id: string; sessions: number }>(sql`
    WITH viewers AS (
      SELECT DISTINCT session_id
      FROM events
      WHERE type = 'pageview' AND path = ${`/product/${productId}`}
    )
    SELECT other.product_id AS product_id, count(DISTINCT other.session_id) AS sessions
    FROM (
      SELECT session_id, replace(path, '/product/', '') AS product_id
      FROM events
      WHERE type = 'pageview' AND path LIKE '/product/%'
    ) AS other
    JOIN viewers ON viewers.session_id = other.session_id
    JOIN products ON products.id = other.product_id
    WHERE other.product_id <> ${productId}
    GROUP BY other.product_id
    ORDER BY sessions DESC, other.product_id
    LIMIT ${limit}
  `)

  return getProductsByIds(rows.map((row) => row.product_id))
}

/**
 * Personalised rail for logged-in users: similarity neighbours of everything the
 * user has favourited or clicked, minus what they already engaged with.
 */
export async function getPersonalizedProducts(userId: string, limit = 4): Promise<Product[]> {
  const seeds = db.all<{ product_id: string }>(sql`
    SELECT product_id FROM (
      SELECT product_id, 2 AS weight FROM favourites WHERE user_id = ${userId}
      UNION ALL
      SELECT product_id, 1 AS weight FROM events
        WHERE user_id = ${userId} AND product_id IS NOT NULL AND type = 'click'
    )
    GROUP BY product_id
    ORDER BY sum(weight) DESC
    LIMIT 10
  `)

  if (seeds.length === 0) return []
  const seedIds = seeds.map((row) => row.product_id)

  const recommendations = db.all<{ related_id: string; score: number }>(sql`
    SELECT related_id, sum(score) AS score
    FROM product_similarity
    WHERE product_id IN (${sql.join(seedIds.map((id) => sql`${id}`), sql`, `)})
      AND related_id NOT IN (${sql.join(seedIds.map((id) => sql`${id}`), sql`, `)})
    GROUP BY related_id
    ORDER BY score DESC
    LIMIT ${limit}
  `)

  if (recommendations.length === 0) {
    // No similarity data yet — fall back to top-rated products in the user's
    // favourite categories.
    const fallback = db.all<{ id: string }>(sql`
      SELECT p.id
      FROM products p
      WHERE p.category IN (
        SELECT DISTINCT f_p.category
        FROM favourites f
        JOIN products f_p ON f_p.id = f.product_id
        WHERE f.user_id = ${userId}
      )
      AND p.id NOT IN (${sql.join(seedIds.map((id) => sql`${id}`), sql`, `)})
      ORDER BY p.rating DESC NULLS LAST, p.review_count DESC
      LIMIT ${limit}
    `)
    return getProductsByIds(fallback.map((row) => row.id))
  }

  return getProductsByIds(recommendations.map((row) => row.related_id))
}

/** Products the user favourited, newest first. */
export async function getFavouriteProducts(userId: string): Promise<Product[]> {
  const rows = db
    .select({ product_id: favourites.product_id })
    .from(favourites)
    .where(eq(favourites.user_id, userId))
    .orderBy(desc(favourites.created_at))
    .all()

  return getProductsByIds(rows.map((row) => row.product_id))
}
