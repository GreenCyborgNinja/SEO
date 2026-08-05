import 'server-only'

import { and, eq } from 'drizzle-orm'
import { db } from './client'
import { favourites } from './schema'

export async function getFavouriteIds(userId: string): Promise<string[]> {
  return db
    .select({ product_id: favourites.product_id })
    .from(favourites)
    .where(eq(favourites.user_id, userId))
    .all()
    .map((row) => row.product_id)
}

export async function addFavourite(userId: string, productId: string): Promise<void> {
  db.insert(favourites)
    .values({ user_id: userId, product_id: productId, created_at: new Date().toISOString() })
    .onConflictDoNothing()
    .run()
}

export async function removeFavourite(userId: string, productId: string): Promise<void> {
  db.delete(favourites)
    .where(and(eq(favourites.user_id, userId), eq(favourites.product_id, productId)))
    .run()
}
