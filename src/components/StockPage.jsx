// Stock.jsx — Live price view using ONLY /quote (free tier)
// - Remembers last-viewed symbol when you click "Stock"
// - Shows a day-range bar using high/low/open/prev close
// - Allows favoriting the symbol (shared with Home via localStorage)
// - Embeds themed DiscussionFeed

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Star } from 'lucide-react'
import { buildFinnhubUrl, HAS_FINNHUB_KEY } from '../data/finnhub'
import DiscussionFeed from '../components/DiscussionFeed'

const STORAGE_RECENT = 'sp_recent_tickers'
const STORAGE_FAVORITES = 'sp_favorite_tickers'

export default function Stock() {
  const { symbol: rawSymbol } = useParams()

  // If no :symbol in the URL, fall back to most recent from localStorage, then NVDA.
  const symbol = useMemo(() => {
    if (rawSymbol) return rawSymbol.toUpperCase()
    try {
      const r = JSON.parse(localStorage.getItem(STORAGE_RECENT) || '[]')
      if (Array.isArray(r) && r.length > 0) return r[0].toUpperCase()
    } catch {
      /* ignore */
    }
    return 'NVDA'
  }, [rawSymbol])

  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [favorites, setFavorites] = useState([])

  // Load favorites
  useEffect(() => {
    try {
      const f = JSON.parse(localStorage.getItem(STORAGE_FAVORITES) || '[]')
      if (Array.isArray(f)) setFavorites(f)
    } catch {
      /* ignore */
    }
  }, [])

  // Fetch quote
  useEffect(() => {
    if (!symbol) return

    if (!HAS_FINNHUB_KEY) {
      setError('Live quote disabled: Add VITE_FINNHUB_API_KEY=YOUR_KEY to your .env')
      setQuote(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setQuote(null)
    setError('')

    let cancelled = false

    const fetchQuote = async () => {
      try {
        const url = buildFinnhubUrl('quote', { symbol })
        if (!url) throw new Error('Missing API key')

        const res = await fetch(url)
        if (!res.ok) throw new Error('Network error')

        const json = await res.json()
        if (!cancelled) setQuote(json)
      } catch (e) {
        console.error(e)
        if (!cancelled) setError('Could not load quote data.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchQuote()
    return () => {
      cancelled = true
    }
  }, [symbol])

  // ---- Derived fields ----
  const price = quote?.c ?? null
  const dayHigh = quote?.h ?? null
  const dayLow = quote?.l ?? null
  const open = quote?.o ?? null
  const prevClose = quote?.pc ?? null

  const change =
    price != null && prevClose != null ? price - prevClose : null
  const changePct =
    change != null && prevClose
      ? (change / prevClose) * 100
      : null

  const changeClass =
    change != null ? (change >= 0 ? 'price-up' : 'price-down') : ''

  // ---- Favorites shared with Home ----
  const isFavorite = favorites.includes(symbol)

  const toggleFavorite = () => {
    const clean = symbol.toUpperCase()
    let next
    if (favorites.includes(clean)) {
      next = favorites.filter((s) => s !== clean)
    } else {
      next = [clean, ...favorites]
    }
    setFavorites(next)
    try {
      localStorage.setItem(STORAGE_FAVORITES, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }

  // ---- Day range graphic (low → high with markers) ----
  const hasRange =
    price != null &&
    dayLow != null &&
    dayHigh != null &&
    dayHigh > dayLow

  const percentBetween = (value) =>
    ((value - dayLow) / (dayHigh - dayLow)) * 100

  const pricePct = hasRange ? Math.min(100, Math.max(0, percentBetween(price))) : null
  const openPct = hasRange && open != null ? percentBetween(open) : null
  const prevPct = hasRange && prevClose != null ? percentBetween(prevClose) : null

  return (
    <div className="stock" style={{ marginTop: 16 }}>
      <div className="grid">
        {/* LEFT: Quote + range graphic */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="space-between" style={{ marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ marginBottom: 0 }}>{symbol}</h2>
                {/* Favorite button */}
                <button
                  type="button"
                  className={`btn ghost ${isFavorite ? 'active' : ''}`}
                  onClick={toggleFavorite}
                  aria-label={
                    isFavorite
                      ? `Remove ${symbol} from favorites`
                      : `Add ${symbol} to favorites`
                  }
                  style={{
                    padding: 6,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Star
                    size={16}
                    fill={isFavorite ? 'currentColor' : 'none'}
                  />
                </button>
              </div>

              <div style={{ textAlign: 'right' }}>
                {price != null ? (
                  <>
                    <div style={{ fontSize: 26, fontWeight: 700 }}>
                      ${price.toFixed(2)}
                    </div>
                    {change != null && changePct != null && (
                      <div className={`small ${changeClass}`} style={{ marginTop: 4 }}>
                        {change >= 0 ? '+' : ''}
                        {change.toFixed(2)} ({changePct >= 0 ? '+' : ''}
                        {changePct.toFixed(2)}%)
                      </div>
                    )}
                  </>
                ) : (
                  <div className="small" style={{ opacity: 0.85 }}>
                    {HAS_FINNHUB_KEY
                      ? loading
                        ? 'Loading quote…'
                        : 'Quote unavailable'
                      : 'Quote unavailable'}
                  </div>
                )}
              </div>
            </div>

            <p className="small" style={{ marginTop: 4 }}>
              Real-time quote powered by Finnhub free tier.
            </p>

            {/* Day range graphic */}
            {hasRange && (
              <div className="day-range" style={{ marginTop: 14 }}>
                <div className="day-range-track">
                  {/* base track */}
                  <div className="day-range-track-bg" />
                  {/* price position */}
                  {pricePct != null && (
                    <div
                      className="day-range-price"
                      style={{ left: `${pricePct}%` }}
                    />
                  )}
                  {/* open + prev close ticks */}
                  {openPct != null && (
                    <div
                      className="day-range-marker day-range-marker-open"
                      style={{ left: `${openPct}%` }}
                      title={`Open $${open?.toFixed(2)}`}
                    />
                  )}
                  {prevPct != null && (
                    <div
                      className="day-range-marker day-range-marker-prev"
                      style={{ left: `${prevPct}%` }}
                      title={`Prev close $${prevClose?.toFixed(2)}`}
                    />
                  )}
                </div>
                <div className="space-between small" style={{ marginTop: 6 }}>
                  <span>Low ${dayLow.toFixed(2)}</span>
                  <span>High ${dayHigh.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* DETAILS ROW */}
            {quote && (
              <div className="row" style={{ marginTop: 14, flexWrap: 'wrap', gap: 10 }}>
                {open != null && (
                  <span className="badge">
                    <strong>Open</strong>&nbsp;${open.toFixed(2)}
                  </span>
                )}
                {prevClose != null && (
                  <span className="badge">
                    <strong>Prev Close</strong>&nbsp;${prevClose.toFixed(2)}
                  </span>
                )}
                {dayHigh != null && (
                  <span className="badge">
                    <strong>High</strong>&nbsp;${dayHigh.toFixed(2)}
                  </span>
                )}
                {dayLow != null && (
                  <span className="badge">
                    <strong>Low</strong>&nbsp;${dayLow.toFixed(2)}
                  </span>
                )}
              </div>
            )}

            {error && (
              <p className="small" style={{ color: '#FF6B6B', marginTop: 8 }}>
                {error}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT: Discussion */}
        <div>
          <div className="card">
            <h3 style={{ marginBottom: 4 }}>Live Discussion</h3>
            <p className="small" style={{ marginBottom: 10 }}>
              Share your take on {symbol}. Bullish, bearish, or just watching?
            </p>
            <DiscussionFeed symbol={symbol} />
          </div>
        </div>
      </div>
    </div>
  )
}
