// src/data/finnhub.js
// Shared Finnhub helpers for the whole app

const API_BASE = 'https://finnhub.io/api/v1'

// Read key from Vite env (must be VITE_*)
const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY

// Flag for components to know if live data is available
export const HAS_FINNHUB_KEY = Boolean(API_KEY)

/**
 * Build a fully-qualified Finnhub URL with all required params,
 * including the ?token=YOUR_KEY query parameter.
 *
 * Example:
 *   buildFinnhubUrl('quote', { symbol: 'AAPL' })
 *   -> 'https://finnhub.io/api/v1/quote?symbol=AAPL&token=...'
 */
export function buildFinnhubUrl(path, params = {}) {
  if (!HAS_FINNHUB_KEY) return null

  const url = new URL(`${API_BASE}/${path}`)

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    url.searchParams.set(key, String(value))
  })

  // Finnhub authentication per docs: token=apiKey
  url.searchParams.set('token', API_KEY)

  return url.toString()
}
