// src/hooks/useStockData.js
import { useEffect, useState } from 'react'

const FINNHUB_BASE = 'https://finnhub.io/api/v1'

export function useStockData(symbol, options = {}) {
  const { resolution = 'D', count = 100 } = options

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!symbol) return

    const controller = new AbortController()
    const token = import.meta.env.VITE_FINNHUB_API_KEY

    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const url = new URL(`${FINNHUB_BASE}/stock/candle`)
        url.searchParams.set('symbol', symbol.toUpperCase())
        url.searchParams.set('resolution', resolution)
        url.searchParams.set('count', count.toString())
        url.searchParams.set('token', token ?? '')

        const res = await fetch(url, { signal: controller.signal })
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`)
        }

        const json = await res.json()

        // Finnhub candle returns { s: "ok"|"no_data"|..., t: [], c: [] }
        if (json.s !== 'ok' || !Array.isArray(json.t) || !Array.isArray(json.c)) {
          throw new Error('No data available for this symbol')
        }

        const points = json.t.map((ts, idx) => ({
          time: new Date(ts * 1000).toISOString().slice(0, 10), // yyyy-mm-dd
          price: json.c[idx],
        }))

        setData(points)
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Failed to fetch stock data:', err)
          setError(err)
          setData([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchData()
    return () => controller.abort()
  }, [symbol, resolution, count])

  return { data, loading, error }
}
