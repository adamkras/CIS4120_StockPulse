// Home.jsx — Landing page for StockPulse
// Lets users search a ticker or choose from trending ones to view stock data and discussion.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Example trending tickers for quick navigation
const TRENDING = ['NVDA', 'AAPL', 'MSFT', 'TSLA', 'AMD', 'GOOGL']

export default function Home() {
  const [ticker, setTicker] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Handle navigation when form is submitted or button clicked
  const handleSubmit = (e) => {
    e.preventDefault()
    const symbol = ticker.trim().toUpperCase()

    if (!symbol) {
      setError('Please enter a valid ticker symbol.')
      return
    }

    setError('')
    navigate(`/stock/${encodeURIComponent(symbol)}`)
  }

  // Allow keyboard Enter on input for accessibility
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit(e)
  }

  return (
    <div className="home" style={{ marginTop: 16 }}>
      {/* Search Card */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ marginBottom: 8 }}>Welcome to StockPulse</h2>
        <p className="small">
          Search any stock ticker to visualize its recent performance and join the live discussion.
        </p>

        <form onSubmit={handleSubmit} className="row" style={{ gap: 10, marginTop: 10 }}>
          <input
            className="input"
            style={{ maxWidth: 260 }}
            placeholder="Enter ticker (e.g., NVDA)"
            aria-label="Ticker symbol"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="btn" type="submit">
            Open
          </button>
        </form>

        {error && (
          <p className="small" style={{ color: '#FF6B6B', marginTop: 6 }}>
            {error}
          </p>
        )}
      </div>

      {/* Trending Section */}
      <div className="card">
        <h3>Trending Stocks</h3>
        <div
          className="row"
          style={{
            flexWrap: 'wrap',
            gap: 10,
            marginTop: 10,
          }}
        >
          {TRENDING.map((symbol) => (
            <button
              key={symbol}
              className="tab"
              style={{
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s, transform 0.1s',
              }}
              onClick={() => navigate(`/stock/${symbol}`)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/stock/${symbol}`)}
              aria-label={`View ${symbol} stock`}
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
