// mockPrices.js — generate a plausible series for a requested timeframe
// API: mockSeries({ range: '1D'|'1W'|'1M' } | { range:'CUSTOM', start, end }, anchors optional)

export function mockSeries(opts = {}) {
  const range = opts.range || '1D'
  const now = opts.now ? new Date(opts.now) : new Date()

  if (range === 'CUSTOM' && opts.start && opts.end) {
    const start = parseISO(opts.start)
    const end = endOfDay(parseISO(opts.end))
    const days = clamp(1, 365, Math.max(1, diffDays(start, end)))
    return generateDailySeries(start, days, opts.anchorStart, opts.anchorEnd)
  }

  if (range === '1D') {
    // ~6.5 trading hours -> ~78 five-minute points; keep smaller for demo
    const points = 40
    return generateIntradaySeries(now, points, 5, opts.anchorStart, opts.anchorEnd)
  }
  if (range === '1W') {
    // last 7 days (trading-ish), 7 points
    const days = 7
    const start = addDays(now, -days + 1)
    return generateDailySeries(start, days, opts.anchorStart, opts.anchorEnd)
  }
  if (range === '1M') {
    // last ~30 days
    const days = 30
    const start = addDays(now, -days + 1)
    return generateDailySeries(start, days, opts.anchorStart, opts.anchorEnd)
  }

  // default fallback
  return generateIntradaySeries(now, 12, 10, opts.anchorStart, opts.anchorEnd)
}

// ---------- helpers ----------

function generateIntradaySeries(now, points, stepMinutes, anchorStart, anchorEnd) {
  const base = anchorStart ?? 140
  const end = anchorEnd ?? base * (1 + (Math.random() - 0.5) * 0.02)
  const pts = []
  let t = new Date(now)
  t.setMinutes(t.getMinutes() - stepMinutes * (points - 1))
  let cur = base
  const drift = (end - base) / (points - 1)

  for (let i = 0; i < points; i++) {
    // small random walk around a linear drift
    const noise = (Math.random() - 0.5) * 0.7
    cur = cur + drift + noise
    pts.push({ time: timeLabelHM(new Date(t)), price: round2(cur) })
    t.setMinutes(t.getMinutes() + stepMinutes)
  }
  return pts
}

function generateDailySeries(startDate, days, anchorStart, anchorEnd) {
  const base = anchorStart ?? 140
  const end = anchorEnd ?? base * (1 + (Math.random() - 0.5) * 0.05)
  const pts = []
  let cur = base
  const drift = (end - base) / Math.max(1, days - 1)
  let d = new Date(startDate)

  for (let i = 0; i < days; i++) {
    const noise = (Math.random() - 0.5) * 1.2
    cur = cur + drift + noise
    pts.push({ time: timeLabelMD(new Date(d)), price: round2(cur) })
    d = addDays(d, 1)
  }
  return pts
}

// date utils
function parseISO(s) { const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d) }
function endOfDay(d) { const t=new Date(d); t.setHours(23,59,59,999); return t }
function addDays(d, n) { const t = new Date(d); t.setDate(t.getDate() + n); return t }
function diffDays(a, b) { return Math.ceil((b - a) / (1000*60*60*24)) }
function clamp(min, max, v){ return Math.max(min, Math.min(max, v)) }

// labels
function timeLabelHM(d) {
  const hh = d.getHours().toString().padStart(2,'0')
  const mm = d.getMinutes().toString().padStart(2,'0')
  return `${hh}:${mm}`
}
function timeLabelMD(d) {
  const mm = (d.getMonth()+1).toString().padStart(2,'0')
  const dd = d.getDate().toString().padStart(2,'0')
  return `${mm}-${dd}`
}

function round2(x){ return Math.round(x * 100) / 100 }
