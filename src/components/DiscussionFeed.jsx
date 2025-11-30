// DiscussionFeed.jsx — symbol-scoped discussion with persistent posts + likes
// - Threads keyed by symbol in localStorage ("sp_discussion_v1")
// - Each stock gets its own thread; no stock => GLOBAL thread
// - New posts and like counts survive navigation & reloads

import { useEffect, useMemo, useState } from 'react'
import { ThumbsUp, Send, Filter } from 'lucide-react'
import { mockPosts as initialPosts } from '../data/mockPosts'

const TAGS = ['All', 'Bullish', 'Bearish']
const STORAGE_KEY = 'sp_discussion_v1'

// ----- helpers to read/write LS -----
function loadThreads() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function saveThreads(threads) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads))
  } catch {
    // ignore quota / privacy errors
  }
}

export default function DiscussionFeed({ symbol }) {
  // Use stock symbol if provided; otherwise one shared GLOBAL thread
  const symbolKey = useMemo(
    () => (symbol && symbol.trim() ? symbol.toUpperCase() : 'GLOBAL'),
    [symbol]
  )

  // threads: { [symbolKey]: Post[] }
  const [threads, setThreads] = useState(() => loadThreads())
  const [activeTag, setActiveTag] = useState('All')
  const [text, setText] = useState('')
  const [tag, setTag] = useState('Bullish')

  // Persist whenever any thread changes
  useEffect(() => {
    saveThreads(threads)
  }, [threads])

  // Posts for the current symbol (fall back to mockPosts if none saved yet)
  const postsForSymbol = threads[symbolKey] ?? initialPosts
  const filtered = useMemo(
    () =>
      activeTag === 'All'
        ? postsForSymbol
        : postsForSymbol.filter((p) => p.tag === activeTag),
    [postsForSymbol, activeTag]
  )

  // ----- state update helpers (always scoped to current symbolKey) -----

  const updateThread = (updater) => {
    setThreads((prev) => {
      const current = prev[symbolKey] ?? initialPosts
      const nextThread = updater(current)
      return { ...prev, [symbolKey]: nextThread }
    })
  }

  const handlePost = () => {
    const body = text.trim()
    if (!body) return

    const newPost = {
      id: Date.now(),
      user: '@you',
      tag,
      body,
      minutesAgo: 0,
      likes: 0,
      liked: false,
    }

    updateThread((current) => [newPost, ...current])
    setText('')
  }

  const toggleLike = (id) => {
    updateThread((current) =>
      current.map((p) =>
        p.id === id
          ? {
              ...p,
              liked: !p.liked,
              likes: p.liked ? Math.max(0, p.likes - 1) : p.likes + 1,
            }
          : p
      )
    )
  }

  const deletePost = (id) => {
    updateThread((current) => current.filter((p) => !(p.id === id && p.user === '@you')))
  }

  // ----- UI -----
  return (
    <div className="discussion">
      {/* Filters */}
      <div className="space-between" style={{ marginBottom: 10 }}>
        <div className="row" style={{ gap: 8 }}>
          {TAGS.map((t) => (
            <button
              key={t}
              type="button"
              className={`tab ${activeTag === t ? 'active' : ''}`}
              style={{ border: 'none', fontSize: 12 }}
              onClick={() => setActiveTag(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <span className="small" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Filter size={14} />
          Filter
        </span>
      </div>

      {/* Composer */}
      <div className="composer" style={{ marginBottom: 12 }}>
        <div className="row" style={{ marginBottom: 6, gap: 8 }}>
          <span className="small" style={{ fontWeight: 600 }}>
            Tag
          </span>
          <select
            className="input"
            style={{ maxWidth: 130, padding: '6px 8px' }}
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          >
            <option value="Bullish">Bullish</option>
            <option value="Bearish">Bearish</option>
          </select>
        </div>

        <textarea
          className="input"
          rows={3}
          placeholder={
            symbolKey === 'GLOBAL'
              ? `Share a ${tag.toLowerCase()} market take…`
              : `Share a ${tag.toLowerCase()} take on ${symbolKey}…`
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ resize: 'vertical', marginBottom: 8 }}
        />

        <div className="space-between">
          <span className="small">@you</span>
          <button
            type="button"
            className="btn"
            onClick={handlePost}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Send size={14} />
            Post
          </button>
        </div>
      </div>

      {/* Posts */}
      <div>
        {filtered.map((p) => (
          <article key={p.id} className="post">
            <div className="space-between" style={{ marginBottom: 4 }}>
              <div className="small">
                <span style={{ fontWeight: 600 }}>{p.user}</span>
                <span className={`tag ${p.tag}`} style={{ marginLeft: 8 }}>
                  {p.tag}
                </span>
              </div>
              <span className="small" style={{ opacity: 0.8 }}>
                {p.minutesAgo}m ago
              </span>
            </div>

            <p style={{ margin: '4px 0 10px', fontSize: 14, lineHeight: 1.4 }}>{p.body}</p>

            <div className="space-between">
              <button
                type="button"
                className={`btn ghost ${p.liked ? 'active' : ''}`}
                onClick={() => toggleLike(p.id)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <ThumbsUp size={14} />
                <span className="small">{p.likes}</span>
              </button>

              {p.user === '@you' && (
                <button
                  type="button"
                  className="small"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#BFD3E0',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                  onClick={() => deletePost(p.id)}
                >
                  Delete
                </button>
              )}
            </div>
          </article>
        ))}

        {filtered.length === 0 && (
          <p className="small" style={{ opacity: 0.8, marginTop: 6 }}>
            No posts yet. Be the first to share a view.
          </p>
        )}
      </div>
    </div>
  )
}
