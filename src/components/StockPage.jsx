// StockPage.jsx — adds timeframe controls (1D/1W/1M) + custom date range
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import useStockData from '../hooks/useStockData'
import StockChart from './StockChart'
import DiscussionFeed from './DiscussionFeed'

const PRESETS = ['1D', '1W', '1M']

export default function StockPage({ symbol: propSymbol }) {
  const params = useParams()
  const symbol = (params.symbol || propSymbol || 'NVDA').toUpperCase()

  // timeframe state
  const [range, setRange] = useState('1D')      // '1D' | '1W' | '1M' | 'CUSTOM'
  const [start, setStart] = useState('')        // YYYY-MM-DD for custom
  const [end, setEnd] = useState('')            // YYYY-MM-DD for custom

  const { series, latest, changePct, loading } = useStockData(
    symbol,
    range === 'CUSTOM'
      ? { range: 'CUSTOM', start, end }
      : { range }
  )

  const up = (changePct ?? 0) >= 0
  const priceText = loading
    ? 'Loading…'
    : `$${(latest ?? 0).toFixed(2)} • ${(changePct >= 0 ? '+' : '')}${(changePct ?? 0).toFixed(2)}%`

  const applyCustom = (e) => {
    e.preventDefault()
    if (!start || !end) return
    setRange('CUSTOM')
  }

  return (
    <div className="grid" style={{ marginTop: 16 }}>
      <div className="card">
        <div className="space-between" style={{ marginBottom: 8 }}>
          <h3>{symbol}</h3>
          <div className={`badge ${up ? 'price-up' : 'price-down'}`}>{priceText}</div>
        </div>

        {/* Timeframe controls */}
        <div className="row" style={{ gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              className={`tab ${range === p ? 'active' : ''}`}
              style={{ border: 'none' }}
              onClick={() => setRange(p)}
            >
              {p}
            </button>
          ))}

          {/* Custom date range */}
          <form onSubmit={applyCustom} className="row" style={{ gap: 8 }}>
            <input
              type="date"
              className="input"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              aria-label="Start date"
              style={{ maxWidth: 160 }}
            />
            <input
              type="date"
              className="input"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              aria-label="End date"
              style={{ maxWidth: 160 }}
            />
            <button className={`btn ${range === 'CUSTOM' ? '' : 'ghost'}`} type="submit">
              Custom
            </button>
          </form>
        </div>

        <StockChart series={series} />
      </div>

      <div className="card">
        <DiscussionFeed />
      </div>
    </div>
  )
}
