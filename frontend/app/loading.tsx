/**
 * Generic route-level skeleton. Deliberately shape-agnostic: this file covers
 * every route, and a product-grid skeleton looked wrong on the detail pages.
 */
export default function Loading() {
  return (
    <div className="py-16 space-y-4" aria-busy="true" aria-label="Inhalte werden geladen">
      <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 w-full max-w-2xl bg-gray-200 rounded animate-pulse" />
      <div className="h-4 w-3/4 max-w-xl bg-gray-200 rounded animate-pulse" />
      <div className="h-72 w-full bg-gray-200 rounded-xl animate-pulse mt-8" />
    </div>
  )
}
