// Stock.jsx — live quote + favorites + timeframe + compare overlay + view logging

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import { buildFinnhubUrl, HAS_FINNHUB_KEY } from '../data/finnhub'
import useAlphaDailySeries from '../hooks/useAlphaDailySeries'
import { HAS_ALPHA_VANTAGE_KEY, getDailySeries } from '../data/alphavantage'
import StockChart from './StockChart'
import DiscussionFeed from './DiscussionFeed'

const STORAGE_FAVORITES = 'sp_favorite_tickers'
const STORAGE_VIEWS = 'sp_views_v1'
const RANGE_PRESETS = ['1D', '1W', '1M']

export default function Stock({
  symbol: propSymbol,
  favoriteSymbols = [],
  onToggleFavorite,
}) {
  const { symbol: routeSymbol } = useParams()
  const symbol = useMemo(
    () => (routeSymbol || propSymbol || 'NVDA').toUpperCase(),
    [routeSymbol, propSymbol]
  )

  // -------- Live quote (Finnhub) --------
  const [quote, setQuote] = useState(null)
  const [loadingQuote, setLoadingQuote] = useState(false)
  const [quoteError, setQuoteError] = useState('')

  useEffect(() => {
    if (!symbol) return

    if (!HAS_FINNHUB_KEY) {
      setQuoteError('Live quote disabled: add VITE_FINNHUB_API_KEY to your .env')
      return
    }

    let cancelled = false
    setLoadingQuote(true)
    setQuote(null)
    setQuoteError('')

    ;(async () => {
      try {
        const url = buildFinnhubUrl('quote', { symbol })
        if (!url) throw new Error('Missing API key')

        const res = await fetch(url)
        if (!res.ok) throw new Error('Network error')
        const json = await res.json()
        if (!cancelled) setQuote(json)
      } catch (err) {
        console.error(err)
        if (!cancelled) setQuoteError('Could not load live quote.')
      } finally {
        if (!cancelled) setLoadingQuote(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [symbol])

  // -------- View logging (for Profile heatmap) --------
  useEffect(() => {
    const now = Date.now()
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_VIEWS) || '[]')
      const list = Array.isArray(existing) ? existing : []

      const last = list[list.length - 1]
      // Guard against React StrictMode double-effect in dev:
      if (last && last.symbol === symbol && now - last.ts < 3000) {
        return
      }

      const ev = { symbol, ts: now }
      localStorage.setItem(STORAGE_VIEWS, JSON.stringify([...list, ev]))
    } catch {
      // ignore
    }
  }, [symbol])

  const price = quote?.c ?? null
  const prevClose = quote?.pc ?? null
  const open = quote?.o ?? null
  const dayHigh = quote?.h ?? null
  const dayLow = quote?.l ?? null

  const change = price != null && prevClose != null ? price - prevClose : null
  const changePct =
    change != null && prevClose != null ? (change / prevClose) * 100 : null
  const changeClass =
    change != null ? (change >= 0 ? 'price-up' : 'price-down') : ''

  // -------- Favorites --------
  const isFavoriteFromParent =
    Array.isArray(favoriteSymbols) && favoriteSymbols.includes(symbol)
  const [isFavoriteLocal, setIsFavoriteLocal] = useState(false)

  useEffect(() => {
    if (isFavoriteFromParent) {
      setIsFavoriteLocal(true)
      return
    }
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_FAVORITES) || '[]')
      setIsFavoriteLocal(Array.isArray(stored) && stored.includes(symbol))
    } catch {
      setIsFavoriteLocal(false)
    }
  }, [symbol, isFavoriteFromParent])

  const handleFavoriteClick = () => {
    if (onToggleFavorite) {
      onToggleFavorite(symbol)
    }
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_FAVORITES) || '[]')
      const list = Array.isArray(stored) ? stored : []
      let next
      if (list.includes(symbol)) {
        next = list.filter((s) => s !== symbol)
        setIsFavoriteLocal(false)
      } else {
        next = [symbol, ...list.filter((s) => s !== symbol)]
        setIsFavoriteLocal(true)
      }
      localStorage.setItem(STORAGE_FAVORITES, JSON.stringify(next))
    } catch {}
  }

  // -------- Historical daily (Alpha Vantage) --------
  const {
    series: rawSeries,
    loading: loadingSeries,
    error: seriesError,
  } = useAlphaDailySeries(symbol)

  // timeframe state
  const [range, setRange] = useState('1M')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const applyCustom = (e) => {
    e.preventDefault()
    if (!customStart || !customEnd) return
    setRange('CUSTOM')
  }

  const filterByRange = (src) => {
    if (!src || !src.length) return []
    if (range === 'CUSTOM' && customStart && customEnd) {
      const s = new Date(customStart)
      const e = new Date(customEnd)
      return src.filter((p) => {
        const d = new Date(p.date)
        return d >= s && d <= e
      })
    }
    const days = range === '1D' ? 1 : range === '1W' ? 5 : 22
    return src.slice(-days)
  }

  const filteredBase = useMemo(
    () => filterByRange(rawSeries),
    [rawSeries, range, customStart, customEnd]
  )

  // -------- Compare overlay (multiple tickers) --------
  const [compareInput, setCompareInput] = useState('')
  const [compareSymbols, setCompareSymbols] = useState([])
  const [compareSeries, setCompareSeries] = useState({}) // {SYM: series[]}
  const [compareLoading, setCompareLoading] = useState({}) // {SYM: bool}
  const [compareErrors, setCompareErrors] = useState({}) // {SYM: string}

  const handleAddCompare = (e) => {
    e.preventDefault()
    const clean = compareInput.trim().toUpperCase()
    if (!clean || clean === symbol || compareSymbols.includes(clean)) {
      setCompareInput('')
      return
    }
    setCompareSymbols((prev) => [...prev, clean])
    setCompareInput('')
  }

  const removeCompare = (sym) => {
    setCompareSymbols((prev) => prev.filter((s) => s !== sym))
    setCompareSeries((prev) => {
      const next = { ...prev }
      delete next[sym]
      return next
    })
    setCompareLoading((prev) => {
      const next = { ...prev }
      delete next[sym]
      return next
    })
    setCompareErrors((prev) => {
      const next = { ...prev }
      delete next[sym]
      return next
    })
  }

  // Fetch historical for each compare symbol
  useEffect(() => {
    if (!HAS_ALPHA_VANTAGE_KEY) return

    compareSymbols.forEach((csym) => {
      const alreadyHave = compareSeries[csym]
      const alreadyLoading = compareLoading[csym]
      if (alreadyHave || alreadyLoading) return

      setCompareLoading((prev) => ({ ...prev, [csym]: true }))

      getDailySeries(csym)
        .then((s) => {
          setCompareSeries((prev) => ({ ...prev, [csym]: s }))
          setCompareErrors((prev) => ({ ...prev, [csym]: '' }))
        })
        .catch((err) => {
          console.error(err)
          setCompareErrors((prev) => ({
            ...prev,
            [csym]: err.message || 'Error loading data',
          }))
        })
        .finally(() => {
          setCompareLoading((prev) => ({ ...prev, [csym]: false }))
        })
    })
  }, [compareSymbols, compareSeries, compareLoading])

  const combinedData = useMemo(() => {
    if (!filteredBase || !filteredBase.length) return []

    const dateMaps = {}
    compareSymbols.forEach((csym) => {
      const raw = compareSeries[csym]
      if (!raw || !raw.length) return
      const filtered = filterByRange(raw)
      dateMaps[csym] = Object.fromEntries(
        filtered.map((p) => [p.date, p.close])
      )
    })

    return filteredBase.map((p) => {
      const row = { date: p.date, [symbol]: p.close }
      compareSymbols.forEach((csym) => {
        const m = dateMaps[csym]
        if (m && m[p.date] != null) row[csym] = m[p.date]
      })
      return row
    })
  }, [
    filteredBase,
    compareSeries,
    compareSymbols,
    range,
    customStart,
    customEnd,
    symbol,
  ])

  const anyCompareLoading = Object.values(compareLoading).some(Boolean)

  const lineKeys = [
    { key: symbol, label: symbol, isPrimary: true },
    ...compareSymbols.map((csym) => ({ key: csym, label: csym })),
  ]

  return (
    <div className="grid" style={{ marginTop: 16 }}>
      {/* LEFT: quote + chart + compare */}
      <div className="card">
        <div className="space-between" style={{ marginBottom: 8 }}>
          <div className="row" style={{ gap: 8, alignItems: 'center' }}>
            <h3 style={{ marginBottom: 0 }}>{symbol}</h3>
            <button
              type="button"
              onClick={handleFavoriteClick}
              aria-label={
                isFavoriteLocal ? 'Remove from favorites' : 'Add to favorites'
              }
              style={{
                borderRadius: '999px',
                border: `1px solid ${
                  isFavoriteLocal ? '#5BC0BE' : '#2a3658'
                }`,
                background: isFavoriteLocal ? '#123b3a' : 'transparent',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill={isFavoriteLocal ? '#5BC0BE' : 'none'}
                stroke={isFavoriteLocal ? '#5BC0BE' : '#A9B4D8'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9" />
              </svg>
            </button>
          </div>

          <div style={{ textAlign: 'right' }}>
            {price != null ? (
              <>
                <div style={{ fontSize: 26, fontWeight: 700 }}>
                  ${price.toFixed(2)}
                </div>
                {change != null && changePct != null && (
                  <div
                    className={`small ${changeClass}`}
                    style={{ marginTop: 2 }}
                  >
                    {change >= 0 ? '+' : ''}
                    {change.toFixed(2)} ({changePct >= 0 ? '+' : ''}
                    {changePct.toFixed(2)}%)
                  </div>
                )}
              </>
            ) : (
              <p className="small" style={{ opacity: 0.85 }}>
                {loadingQuote
                  ? 'Loading quote…'
                  : HAS_FINNHUB_KEY
                  ? 'Quote unavailable'
                  : 'Live quote disabled'}
              </p>
            )}
          </div>
        </div>

        {quote && (
          <div
            className="row"
            style={{ marginTop: 4, flexWrap: 'wrap', gap: 8 }}
          >
            <span className="badge">
              <strong>High:</strong>{' '}
              {dayHigh != null ? `$${dayHigh.toFixed(2)}` : '—'}
            </span>
            <span className="badge">
              <strong>Low:</strong>{' '}
              {dayLow != null ? `$${dayLow.toFixed(2)}` : '—'}
            </span>
            <span className="badge">
              <strong>Open:</strong>{' '}
              {open != null ? `$${open.toFixed(2)}` : '—'}
            </span>
            <span className="badge">
              <strong>Prev close:</strong>{' '}
              {prevClose != null ? `$${prevClose.toFixed(2)}` : '—'}
            </span>
          </div>
        )}

        {quoteError && (
          <p className="small" style={{ color: '#FF6B6B', marginTop: 6 }}>
            {quoteError}
          </p>
        )}

        {/* Timeframe controls */}
        <div
          className="row"
          style={{
            gap: 8,
            marginTop: 14,
            marginBottom: 10,
            flexWrap: 'wrap',
          }}
        >
          {RANGE_PRESETS.map((p) => (
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

          <form
            onSubmit={applyCustom}
            className="row"
            style={{ gap: 8, flexWrap: 'wrap' }}
          >
            <input
              type="date"
              className="input"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              aria-label="Start date"
              style={{ maxWidth: 150 }}
            />
            <input
              type="date"
              className="input"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              aria-label="End date"
              style={{ maxWidth: 150 }}
            />
            <button
              className={`btn ${range === 'CUSTOM' ? '' : 'ghost'}`}
              type="submit"
              style={{ fontSize: 11 }}
            >
              Custom
            </button>
          </form>
        </div>

        {/* Compare controls */}
        <div style={{ marginBottom: 8 }}>
          <p className="small" style={{ marginBottom: 4 }}>
            Compare with other tickers
          </p>

          <form
            onSubmit={handleAddCompare}
            className="row"
            style={{ gap: 6, flexWrap: 'wrap', marginBottom: 6 }}
          >
            <input
              className="input"
              placeholder="Add ticker — e.g., MSFT"
              value={compareInput}
              onChange={(e) => setCompareInput(e.target.value.toUpperCase())}
              style={{ maxWidth: 180 }}
            />
            <button
              type="submit"
              className="btn ghost"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
              }}
            >
              <Plus size={14} />
              Add
            </button>
          </form>

          {compareSymbols.length > 0 && (
            <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
              {compareSymbols.map((csym) => (
                <span
                  key={csym}
                  className="badge"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {csym}
                  <button
                    type="button"
                    onClick={() => removeCompare(csym)}
                    aria-label={`Remove ${csym}`}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {Object.entries(compareErrors)
            .filter(([, msg]) => msg)
            .map(([sym, msg]) => (
              <p
                key={sym}
                className="small"
                style={{ color: '#FFB85C', marginTop: 4 }}
              >
                {sym}: {msg}
              </p>
            ))}
        </div>

        {/* Chart (base + overlay) */}
        <StockChart
          data={combinedData}
          loading={loadingSeries || anyCompareLoading}
          error={seriesError}
          seriesKeys={lineKeys}
        />
      </div>

      {/* RIGHT: discussion */}
      <div className="card">
        <DiscussionFeed symbol={symbol} />
      </div>
    </div>
  )
}
