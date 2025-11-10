// useStockData.js — timeframe-aware data hook
import { useEffect, useMemo, useState } from 'react'
import { mockSeries } from '../data/mockPrices'

/**
 * useStockData(symbol, options)
 * options:
 *   - { range: '1D' | '1W' | '1M' }
 *   - { range: 'CUSTOM', start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
 */
export default function useStockData(symbol = 'NVDA', options = { range: '1D' }) {
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)

      // Try live (quote) for the latest point; synthesize series around it for the chosen range.
      const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_KEY
      const url = FINNHUB_KEY
        ? `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_KEY}`
        : null

      try {
        if (url) {
          const r = await fetch(url)
          if (!r.ok) throw new Error('bad response')
          const data = await r.json()
          const now = new Date()
          const pc = data?.pc ?? 100
          const c = data?.c ?? pc

          // Generate a synthetic series around pc..c for the requested range.
          const pts = mockSeries({
            range: options?.range ?? '1D',
            start: options?.start,
            end: options?.end,
            anchorStart: pc,
            anchorEnd: c,
            now
          })
          if (!cancelled) setSeries(pts)
        } else {
          // Pure mock
          const pts = mockSeries(options)
          if (!cancelled) setSeries(pts)
        }
      } catch {
        // Fallback to mock on any failure
        const pts = mockSeries(options)
        if (!cancelled) setSeries(pts)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
    // react to symbol or timeframe changes
  }, [symbol, options?.range, options?.start, options?.end])

  const latest = useMemo(() => series.at(-1)?.price, [series])
  const first = useMemo(() => series[0]?.price, [series])

  const changePct = useMemo(() => {
    if (!latest || !first) return 0
    return ((latest - first) / first) * 100
  }, [latest, first])

  return { series, latest, changePct, loading }
}
