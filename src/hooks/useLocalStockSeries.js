// src/hooks/useLocalStockSeries.js
// Local-only replacement for any Alpha Vantage time-series hook.

import { useMemo } from 'react'
import { buildMockSeries } from '../data/mockAlphaSeries'

/**
 * @param {string} symbol
 * @param {'1D'|'1W'|'1M'|'3M'|'6M'|'1Y'|'ALL'|'CUSTOM'} range
 * @param {{start?: string, end?: string}} options
 */
export default function useLocalStockSeries(symbol, range = '1M', options = {}) {
  const { start, end } = options

  const series = useMemo(() => {
    const baseRange = range === 'CUSTOM' ? 'ALL' : range
    let data = buildMockSeries(symbol || 'NVDA', baseRange)

    if (range === 'CUSTOM' && start && end) {
      data = data.filter((d) => d.date >= start && d.date <= end)
    }

    return data
  }, [symbol, range, start, end])

  // To match your existing hook shape
  const latest = series.length ? series[series.length - 1].close : null
  const first = series.length ? series[0].close : null
  const change = latest != null && first != null ? latest - first : null
  const changePct =
    change != null && first != null ? (change / first) * 100 : null

  return {
    series,
    latest,
    changePct,
    loading: false,
    error: '',
  }
}
