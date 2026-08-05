import 'server-only'

import { and, asc, desc, eq, inArray, isNotNull, like, or, sql } from 'drizzle-orm'
import { db } from './client'
import { categories, products, type Category, type Product } from './schema'

export type { Product, Category }

/**
 * Read-side repository. better-sqlite3 is synchronous, but every function stays
 * `async` so call sites (and a future swap to a networked driver) keep working.
 */

export async function getAllProducts(options: { limit?: number } = {}): Promise<Product[]> {
  const query = db.select().from(products).orderBy(desc(products.updated_at), asc(products.name))
  return options.limit ? query.limit(options.limit).all() : query.all()
}

export async function getProductById(id: string): Promise<Product | null> {
  const row = db
    .select()
    .from(products)
    .where(or(eq(products.id, id), eq(products.external_id, id)))
    .limit(1)
    .get()
  return row ?? null
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return []
  const rows = db.select().from(products).where(inArray(products.id, ids)).all()
  // Preserve the caller's ordering (recommendation ranking, curated ad pool, …).
  const byId = new Map(rows.map((row) => [row.id, row]))
  return ids.map((id) => byId.get(id)).filter((row): row is Product => row != null)
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  return db
    .select()
    .from(products)
    .where(eq(products.category, slug))
    .orderBy(desc(products.rating), asc(products.price))
    .all()
}

/** Deals = anything with a struck-through original price above the current one. */
export async function getDeals(): Promise<Product[]> {
  return db
    .select()
    .from(products)
    .where(and(isNotNull(products.original_price), sql`${products.original_price} > ${products.price}`))
    .orderBy(desc(sql`(${products.original_price} - ${products.price}) / ${products.original_price}`))
    .all()
}

export async function searchProducts(term: string, limit = 20): Promise<Product[]> {
  const needle = `%${term.trim().toLowerCase()}%`
  if (needle.length <= 3) return []
  return db
    .select()
    .from(products)
    .where(
      or(
        like(sql`lower(${products.name})`, needle),
        like(sql`lower(coalesce(${products.brand}, ''))`, needle),
        like(sql`lower(coalesce(${products.category}, ''))`, needle)
      )
    )
    .orderBy(desc(products.rating))
    .limit(limit)
    .all()
}

export async function getAllProductIds(): Promise<{ id: string; updated_at: string }[]> {
  return db.select({ id: products.id, updated_at: products.updated_at }).from(products).all()
}

export async function countProducts(): Promise<number> {
  const row = db.select({ count: sql<number>`count(*)` }).from(products).get()
  return row?.count ?? 0
}

export interface CategoryWithCount extends Category {
  product_count: number
}

/**
 * Categories joined with their live product count. The nav uses this to hide
 * empty categories instead of linking users into dead ends.
 */
export async function getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  return db
    .select({
      slug: categories.slug,
      name: categories.name,
      description: categories.description,
      sort_order: categories.sort_order,
      product_count: sql<number>`count(${products.id})`,
    })
    .from(categories)
    .leftJoin(products, eq(products.category, categories.slug))
    .groupBy(categories.slug)
    .orderBy(asc(categories.sort_order))
    .all()
}

export async function getCategory(slug: string): Promise<Category | null> {
  const row = db.select().from(categories).where(eq(categories.slug, slug)).limit(1).get()
  return row ?? null
}

export async function getAllCategories(): Promise<Category[]> {
  return db.select().from(categories).orderBy(asc(categories.sort_order)).all()
}
