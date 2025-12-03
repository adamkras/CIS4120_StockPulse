// Profile.jsx — StockPulse "My Dashboard"
//
// Shows:
// - Market personality + streak
// - Posting stats (bullish vs bearish)
// - Favorite-sector pie chart
// - Watchlist mood + biggest movers using /quote
// - 7-day view activity "heatmap" (bar chart)

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, BarChart3, Crown } from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { buildFinnhubUrl, HAS_FINNHUB_KEY } from '../data/finnhub'

const STORAGE_RECENT = 'sp_recent_tickers'
const STORAGE_FAVORITES = 'sp_favorite_tickers'
const STORAGE_POSTS = 'sp_posts_by_symbol_v2'
const STORAGE_LAST_VISIT = 'sp_last_visit'
const STORAGE_STREAK = 'sp_visit_streak'
const STORAGE_VIEWS = 'sp_views_v1'

const SECTOR_MAP = {
  Tech: ['AAPL', 'MSFT', 'NVDA', 'AMD', 'AMZN', 'GOOGL', 'META', 'SMCI', 'AVGO', 'NFLX'],
  Auto: ['TSLA', 'F', 'GM'],
  Finance: ['JPM', 'BAC', 'COIN', 'SOFI'],
  Entertainment: ['DIS', 'PARA', 'WBD'],
  Energy: ['XOM', 'CVX'],
}

const SECTOR_COLORS = ['#36CFC9', '#5B8DEF', '#A26BFF', '#FFB85C', '#FF6B6B']

export default function Profile() {
  const navigate = useNavigate()
  const [recent, setRecent] = useState([])
  const [favorites, setFavorites] = useState([])
  const [postsBySymbol, setPostsBySymbol] = useState({})
  const [viewEvents, setViewEvents] = useState([])
  const [quotes, setQuotes] = useState({})
  const [streak, setStreak] = useState(1)

  useEffect(() => {
    try {
      const r = JSON.parse(localStorage.getItem(STORAGE_RECENT) || '[]')
      const f = JSON.parse(localStorage.getItem(STORAGE_FAVORITES) || '[]')
      const p = JSON.parse(localStorage.getItem(STORAGE_POSTS) || '{}')
      const v = JSON.parse(localStorage.getItem(STORAGE_VIEWS) || '[]')

      if (Array.isArray(r)) setRecent(r)
      if (Array.isArray(f)) setFavorites(f)
      if (p && typeof p === 'object') setPostsBySymbol(p)
      if (Array.isArray(v)) setViewEvents(v)
    } catch {}

    const todayStr = new Date().toDateString()
    const last = localStorage.getItem(STORAGE_LAST_VISIT)
    const prevStreak = Number(localStorage.getItem(STORAGE_STREAK) || '0')

    let nextStreak = 1
    if (last) {
      const lastDate = new Date(last)
      const todayDate = new Date(todayStr)
      const diffDays = (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)

      if (diffDays === 0) {
        nextStreak = prevStreak || 1
      } else if (diffDays === 1) {
        nextStreak = (prevStreak || 0) + 1
      } else {
        nextStreak = 1
      }
    }

    setStreak(nextStreak)
    localStorage.setItem(STORAGE_STREAK, String(nextStreak))
    localStorage.setItem(STORAGE_LAST_VISIT, todayStr)
  }, [])

  useEffect(() => {
    if (!HAS_FINNHUB_KEY || favorites.length === 0) return

    let cancelled = false

    const run = async () => {
      const results = {}
      await Promise.all(
        favorites.map(async (symbol) => {
          try {
            const url = buildFinnhubUrl('quote', { symbol })
            if (!url) return
            const res = await fetch(url)
            if (!res.ok) return
            const json = await res.json()
            results[symbol] = json
          } catch {}
        })
      )
      if (!cancelled) setQuotes(results)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [favorites])

  const allPosts = useMemo(() => Object.values(postsBySymbol).flat(), [postsBySymbol])
  const totalPosts = allPosts.length
  const bullishPosts = allPosts.filter((p) => p.tag === 'Bullish').length
  const bearishPosts = allPosts.filter((p) => p.tag === 'Bearish').length

  const personality =
    bullishPosts > bearishPosts
      ? '🚀 Growth Chaser'
      : bearishPosts > bullishPosts
      ? '🛡️ Risk Manager'
      : '📘 Balanced Strategist'

  const sectorCounts = {}
  Object.entries(SECTOR_MAP).forEach(([sector, tickers]) => {
    sectorCounts[sector] = favorites.filter((f) => tickers.includes(f)).length
  })

  const sectorPieData = Object.entries(sectorCounts)
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0)

  const topSector =
    sectorPieData.length > 0
      ? sectorPieData.slice().sort((a, b) => b.value - a.value)[0].name
      : 'No clear bias yet'

  let green = 0
  let red = 0
  favorites.forEach((sym) => {
    const q = quotes[sym]
    if (!q || q.c == null || q.pc == null) return
    const diff = q.c - q.pc
    if (diff > 0) green++
    else if (diff < 0) red++
  })

  const movers = favorites
    .map((sym) => {
      const q = quotes[sym]
      if (!q || q.c == null || q.pc == null || q.pc === 0) return null
      const pct = ((q.c - q.pc) / q.pc) * 100
      return { symbol: sym, pct }
    })
    .filter(Boolean)
    .sort((a, b) => b.pct - a.pct)

  const biggestWinner = movers[0]
  const biggestLoser = movers[movers.length - 1]

  const heatmapData = useMemo(() => {
    const today = new Date()
    const data = []

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const label = d.toLocaleDateString(undefined, { weekday: 'short' })

      const count = viewEvents.filter((ev) => {
        if (!ev || !ev.ts) return false
        const dt = new Date(ev.ts)
        return (
          dt.getFullYear() === d.getFullYear() &&
          dt.getMonth() === d.getMonth() &&
          dt.getDate() === d.getDate()
        )
      }).length

      data.push({ day: label, views: count })
    }
    return data
  }, [viewEvents])

  const goToSymbol = (s) => navigate(`/stock/${s}`)

  return (
    <div className="profile" style={{ marginTop: 16 }}>
      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ marginBottom: 4 }}>Your StockPulse Profile</h2>
        <p className="small">
          Personalized stats based on your favorites, posts, and recent activity.
        </p>

        <div className="row" style={{ flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
          <div className="badge">
            <Crown size={14} style={{ marginRight: 4 }} />
            {personality}
          </div>
          <div className="badge">🔥 {streak}-day streak</div>
          <div className="badge">
            <BarChart3 size={14} style={{ marginRight: 4 }} />
            {totalPosts} posts ({bullishPosts} bullish / {bearishPosts} bearish)
          </div>
          <div className="badge">
            <Star size={14} style={{ marginRight: 4 }} />
            {favorites.length} favorites
          </div>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h3 style={{ marginBottom: 4 }}>Favorite Sector Mix</h3>
          <p className="small">Based on your favorited tickers.</p>

          {sectorPieData.length === 0 ? (
            <p className="small" style={{ marginTop: 8, opacity: 0.8 }}>
              Favorite a few stocks to see your sector breakdown.
            </p>
          ) : (
            <>
              <div style={{ width: '100%', height: 220, marginTop: 8 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={sectorPieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {sectorPieData.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={SECTOR_COLORS[index % SECTOR_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} favorites`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <p className="small" style={{ marginTop: 8 }}>
                Current tilt: <strong>{topSector}</strong>
              </p>
            </>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 4 }}>Watchlist Mood</h3>
          <p className="small">How your favorites are doing today.</p>

          {!HAS_FINNHUB_KEY || favorites.length === 0 ? (
            <p className="small" style={{ marginTop: 8, opacity: 0.8 }}>
              Add a Finnhub API key and favorite some tickers to see this.
            </p>
          ) : movers.length === 0 ? (
            <p className="small" style={{ marginTop: 8, opacity: 0.8 }}>
              Loading live data…
            </p>
          ) : (
            <>
              <h2 style={{ marginTop: 12, marginBottom: 4 }}>
                {green}–{red}{' '}
                {green >= red ? (
                  <span className="price-up">(Bullish tilt)</span>
                ) : (
                  <span className="price-down">(Bearish tilt)</span>
                )}
              </h2>

              <div style={{ marginTop: 12 }}>
                {biggestWinner && (
                  <div className="small" style={{ marginBottom: 4 }}>
                    <strong>Top gainer:</strong> {biggestWinner.symbol}{' '}
                    <span className="price-up">
                      {biggestWinner.pct >= 0 ? '+' : ''}
                      {biggestWinner.pct.toFixed(2)}%
                    </span>
                  </div>
                )}
                {biggestLoser && (
                  <div className="small">
                    <strong>Bottom gainer:</strong> {biggestLoser.symbol}{' '}
                    <span className="price-down">
                      {biggestLoser.pct >= 0 ? '+' : ''}
                      {biggestLoser.pct.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 4 }}>Last 7 Days of Activity</h3>
        <p className="small">
          Each bar shows how many times you opened a stock page on that day.
        </p>

        <div style={{ width: '100%', height: 220, marginTop: 8 }}>
          <ResponsiveContainer>
            <BarChart data={heatmapData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={30} />
              <Tooltip />
              <Bar dataKey="views" fill="#3EE0C3" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {heatmapData.every((d) => d.views === 0) && (
          <p className="small" style={{ marginTop: 6, opacity: 0.8 }}>
            Start opening tickers and this chart will light up.
          </p>
        )}
      </div>
    </div>
  )
}