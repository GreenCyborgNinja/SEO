'use client'

import { useEffect, useState } from 'react'
import { getRandomAd } from '@/lib/ads'
import type { Product } from '@/lib/supabase'
import AdBanner from './AdBanner'

export function LeftSidebar() {
  const [ad, setAd] = useState<Product | null>(null)

  useEffect(() => {
    setAd(getRandomAd())
  }, [])

  if (!ad) return null

  return (
    <aside className="hidden xl:block w-[200px] shrink-0">
      <div className="sticky top-24">
        <AdBanner product={ad} variant="skyscraper" />
      </div>
    </aside>
  )
}

export function RightSidebar() {
  const [ad, setAd] = useState<Product | null>(null)

  useEffect(() => {
    setAd(getRandomAd())
  }, [])

  if (!ad) return null

  return (
    <aside className="hidden lg:block w-[350px] shrink-0">
      <div className="sticky top-24">
        <AdBanner product={ad} variant="wide-skyscraper" />
      </div>
    </aside>
  )
}

export function BottomBanner() {
  const [ad, setAd] = useState<Product | null>(null)

  useEffect(() => {
    setAd(getRandomAd())
  }, [])

  if (!ad) return null

  return (
    <div className="container mx-auto px-4 py-4">
      <AdBanner product={ad} variant="leaderboard" />
    </div>
  )
}
