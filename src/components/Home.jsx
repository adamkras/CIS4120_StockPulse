// Home.jsx — StockPulse landing page (no Finnhub calls)
// - Static "trending" lists by range
// - Search box routes to /stock/:symbol
// - LocalStorage-backed Recent + Favorites with star toggle

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Star } from 'lucide-react'

// Simple mock trending lists by timeframe
const TRENDING_BY_RANGE = {
  HOUR: ['NVDA', 'TSLA', 'AMD', 'META', 'SOFI'],
  DAY: ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AVGO'],
  WEEK: ['TSLA', 'AMZN', 'NVDA', 'SMCI', 'NFLX'],
}

const STORAGE_RECENT = 'sp_recent_tickers'
const STORAGE_FAVORITES = 'sp_favorite_tickers'

export default function Home() {
  const [ticker, setTicker] = useState('')
  const [error, setError] = useState('')
  const [range, setRange] = useState('DAY') // 'HOUR' | 'DAY' | 'WEEK'

  const [recent, setRecent] = useState([])
  const [favorites, setFavorites] = useState([])

  const navigate = useNavigate()

  // Load recent + favorites from localStorage on mount
  useEffect(() => {
    try {
      const r = JSON.parse(localStorage.getItem(STORAGE_RECENT) || '[]')
      const f = JSON.parse(localStorage.getItem(STORAGE_FAVORITES) || '[]')
      if (Array.isArray(r)) setRecent(r)
      if (Array.isArray(f)) setFavorites(f)
    } catch {
      // ignore parse errors
    }
  }, [])

  // Helper to persist arrays
  const saveRecent = (next) => {
    setRecent(next)
    try {
      localStorage.setItem(STORAGE_RECENT, JSON.stringify(next))
    } catch {}
  }

  const saveFavorites = (next) => {
    setFavorites(next)
    try {
      localStorage.setItem(STORAGE_FAVORITES, JSON.stringify(next))
    } catch {}
  }

  // Navigate to a stock and update "recently viewed"
  const goToSymbol = (symbol) => {
    const clean = symbol.trim().toUpperCase()
    if (!clean) return

    const next = [clean, ...recent.filter((s) => s !== clean)].slice(0, 10)
    saveRecent(next)

    navigate(`/stock/${encodeURIComponent(clean)}`)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const symbol = ticker.trim().toUpperCase()
    if (!symbol) {
      setError('Please enter a valid ticker symbol.')
      return
    }
    setError('')
    goToSymbol(symbol)
    setTicker('')
  }

  const handleChipKeyDown = (e, symbol) => {
    if (e.key === 'Enter') goToSymbol(symbol)
  }

  const toggleFavorite = (symbol) => {
    const clean = symbol.toUpperCase()
    let next
    if (favorites.includes(clean)) {
      next = favorites.filter((s) => s !== clean)
    } else {
      next = [clean, ...favorites]
    }
    saveFavorites(next)
  }

  const trending = TRENDING_BY_RANGE[range] ?? []

  return (
    <div className="home" style={{ marginTop: 16 }}>
      {/* Main hero / search card */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ marginBottom: 4 }}>Welcome to StockPulse</h2>
        <p className="small">
          Search a ticker to see its live price and join the discussion, or start with a popular
          stock below.
        </p>

        {/* Search row */}
        <form
          onSubmit={handleSubmit}
          className="row"
          style={{ gap: 10, marginTop: 16, alignItems: 'stretch' }}
        >
          <div
            className="row"
            style={{
              flex: 1,
              gap: 8,
              background: '#0f1a36',
              borderRadius: 8,
              border: '1px solid #2a3658',
              paddingInline: 10,
            }}
          >
            <Search size={18} aria-hidden="true" />
            <input
              className="input"
              style={{ border: 'none', background: 'transparent', paddingLeft: 0 }}
              placeholder="Search ticker — try NVDA"
              aria-label="Ticker symbol"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
            />
          </div>

          <button className="btn" type="submit">
            Go to stock
          </button>
        </form>

        {error && (
          <p className="small" style={{ color: '#FF6B6B', marginTop: 6 }}>
            {error}
          </p>
        )}

        {/* Trending / timeframe controls */}
        <div style={{ marginTop: 18 }}>
          <div className="space-between" style={{ marginBottom: 8 }}>
            <span className="small" style={{ textTransform: 'uppercase', letterSpacing: 0.06 }}>
              Trending stocks
            </span>
            <div className="row" style={{ gap: 6 }}>
              {['HOUR', 'DAY', 'WEEK'].map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`tab ${range === key ? 'active' : ''}`}
                  style={{ border: 'none', fontSize: 11, paddingInline: 10 }}
                  onClick={() => setRange(key)}
                >
                  {key === 'HOUR' && '1H'}
                  {key === 'DAY' && '1D'}
                  {key === 'WEEK' && '1W'}
                </button>
              ))}
            </div>
          </div>

          <div
            className="row"
            style={{
              flexWrap: 'wrap',
              gap: 8,
              marginTop: 4,
            }}
          >
            {trending.map((symbol) => {
              const fav = favorites.includes(symbol)
              return (
                <div key={symbol} className={`ticker-chip ${fav ? 'favorited' : ''}`}>
                  <button
                    type="button"
                    className="ticker-chip__symbol"
                    onClick={() => goToSymbol(symbol)}
                    onKeyDown={(e) => handleChipKeyDown(e, symbol)}
                    aria-label={`View ${symbol} stock`}
                  >
                    {symbol}
                  </button>
                  <button
                    type="button"
                    className={`ticker-chip__fav ${fav ? 'active' : ''}`}
                    onClick={() => toggleFavorite(symbol)}
                    aria-label={
                      fav ? `Remove ${symbol} from favorites` : `Add ${symbol} to favorites`
                    }
                  >
                    <Star size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recently viewed */}
        {recent.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div className="small" style={{ marginBottom: 6 }}>
              Recently viewed:
            </div>
            <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
              {recent.map((symbol) => (
                <button
                  key={symbol}
                  className="tab"
                  style={{ border: 'none', fontSize: 12 }}
                  onClick={() => goToSymbol(symbol)}
                  onKeyDown={(e) => handleChipKeyDown(e, symbol)}
                  aria-label={`View ${symbol} stock again`}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Favorites */}
        {favorites.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div className="small" style={{ marginBottom: 6 }}>
              Favorites:
            </div>
            <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
              {favorites.map((symbol) => (
                <div key={symbol} className={`ticker-chip favorited`}>
                  <button
                    type="button"
                    className="ticker-chip__symbol"
                    onClick={() => goToSymbol(symbol)}
                    aria-label={`View favorite ${symbol} stock`}
                  >
                    {symbol}
                  </button>
                  <button
                    type="button"
                    className="ticker-chip__fav active"
                    onClick={() => toggleFavorite(symbol)}
                    aria-label={`Remove ${symbol} from favorites`}
                  >
                    <Star size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
