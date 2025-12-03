// DiscussionFeed.jsx — per-stock, persistent discussion board
// - Posts & likes saved to localStorage by symbol
// - Filter by All / Bullish / Bearish
// - Like button turns green when active and toggles count
// - Only your own posts (@you) can be deleted

import { useEffect, useMemo, useState } from 'react'
import { ThumbsUp, Send, Filter } from 'lucide-react'

const STORAGE_DISCUSSIONS = 'sp_discussions_v2'

const SEED_POSTS = {
  NVDA: [
    {
      id: 'nvda-1',
      author: 'anon',
      tag: 'Bullish',
      text: 'With inference demand rising, NVDA looks positioned to keep ripping.',
      likes: 23,
      liked: false,
      createdAt: Date.now() - 1000 * 60 * 60 * 6,
    },
    {
      id: 'nvda-2',
      author: 'anon',
      tag: 'Bearish',
      text: 'Valuation is insane on a simple PE basis. Careful sizing here.',
      likes: 18,
      liked: false,
      createdAt: Date.now() - 1000 * 60 * 60 * 3,
    },
  ],
  AAPL: [
    {
      id: 'aapl-1',
      author: 'anon',
      tag: 'Bullish',
      text: 'Buybacks + services margin still underrated by the market IMO.',
      likes: 12,
      liked: false,
      createdAt: Date.now() - 1000 * 60 * 60 * 8,
    },
  ],
}

const DEFAULT_SEED = [
  {
    id: 'generic-1',
    author: 'anon',
    tag: 'Bullish',
    text: 'First! What do you all think about this name?',
    likes: 3,
    liked: false,
    createdAt: Date.now() - 1000 * 60 * 30,
  },
]

const TAGS = ['All', 'Bullish', 'Bearish']

export default function DiscussionFeed({ symbol = 'NVDA' }) {
  const sym = symbol.toUpperCase()

  const [activeTag, setActiveTag] = useState('All')
  const [text, setText] = useState('')
  const [tag, setTag] = useState('Bullish')
  const [posts, setPosts] = useState([])

  // Load posts for this symbol from localStorage or seed defaults
  useEffect(() => {
    let all = {}
    try {
      all = JSON.parse(localStorage.getItem(STORAGE_DISCUSSIONS) || '{}')
    } catch {
      all = {}
    }

    if (Array.isArray(all[sym]) && all[sym].length > 0) {
      setPosts(all[sym])
    } else {
      const seed = SEED_POSTS[sym] || DEFAULT_SEED
      setPosts(seed)
      try {
        localStorage.setItem(
          STORAGE_DISCUSSIONS,
          JSON.stringify({ ...all, [sym]: seed })
        )
      } catch {}
    }
  }, [sym])

  const persist = (nextPosts) => {
    setPosts(nextPosts)
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_DISCUSSIONS) || '{}')
      localStorage.setItem(
        STORAGE_DISCUSSIONS,
        JSON.stringify({ ...all, [sym]: nextPosts })
      )
    } catch {
      // ignore
    }
  }

  const handlePost = (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return

    const newPost = {
      id: `${sym}-${Date.now()}`,
      author: 'you',
      tag,
      text: trimmed,
      likes: 0,
      liked: false,
      createdAt: Date.now(),
    }

    const next = [newPost, ...posts]
    persist(next)
    setText('')
    setTag('Bullish')
    setActiveTag('All')
  }

  const toggleLike = (id) => {
    const next = posts.map((p) => {
      if (p.id !== id) return p
      const liked = !p.liked
      const likes = p.likes + (liked ? 1 : -1)
      return { ...p, liked, likes: Math.max(likes, 0) }
    })
    persist(next)
  }

  // NEW: delete only your own posts
  const deletePost = (id) => {
    const next = posts.filter((p) => p.id !== id)
    persist(next)
  }

  const filteredPosts = useMemo(() => {
    if (activeTag === 'All') return posts
    return posts.filter((p) => p.tag === activeTag)
  }, [posts, activeTag])

  return (
    <div className="discussion">
      <div className="space-between" style={{ marginBottom: 8 }}>
        <h3 style={{ marginBottom: 0 }}>Discussion</h3>
        <span className="small" style={{ opacity: 0.8 }}>
          ${sym}
        </span>
      </div>

      <p className="small" style={{ marginBottom: 10 }}>
        Share your take on {sym}. Bullish, bearish, or just watching?
      </p>

      {/* Filter buttons */}
      <div className="row" style={{ gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
        {TAGS.map((t) => (
          <button
            key={t}
            type="button"
            className={`tab ${activeTag === t ? 'active' : ''}`}
            style={{
              fontSize: 11,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
            onClick={() => setActiveTag(t)}
          >
            <Filter size={12} />
            {t}
          </button>
        ))}
      </div>

      {/* Composer */}
      <form
        onSubmit={handlePost}
        className="card"
        style={{
          background: '#0f1a36',
          borderRadius: 10,
          padding: 10,
          marginBottom: 12,
        }}
      >
        <textarea
          className="input"
          style={{
            width: '100%',
            minHeight: 70,
            resize: 'vertical',
            marginBottom: 6,
          }}
          placeholder={`Share a ${tag.toLowerCase()} take on ${sym}…`}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="space-between" style={{ gap: 8, flexWrap: 'wrap' }}>
          <div className="row" style={{ gap: 6 }}>
            <label className="small" htmlFor="tag-select">
              Tag
            </label>
            <select
              id="tag-select"
              className="input"
              style={{ paddingInline: 6, fontSize: 12, height: 28 }}
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            >
              <option value="Bullish">Bullish</option>
              <option value="Bearish">Bearish</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              paddingInline: 10,
              fontSize: 12,
            }}
          >
            <Send size={14} />
            Post
          </button>
        </div>
      </form>

      {/* Posts list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredPosts.map((p) => (
          <div
            key={p.id}
            className="card"
            style={{
              padding: 10,
              borderRadius: 10,
              background: '#0b132a',
            }}
          >
            <div
              className="row"
              style={{ justifyContent: 'space-between', marginBottom: 4 }}
            >
              <span className="small" style={{ fontWeight: 600 }}>
                {p.tag}
              </span>

              <div className="row" style={{ gap: 6 }}>
                <span className="small" style={{ opacity: 0.7 }}>
                  {p.author === 'you' ? '@you' : '@anon'}
                </span>
                {p.author === 'you' && (
                  <button
                    type="button"
                    onClick={() => deletePost(p.id)}
                    className="btn ghost"
                    style={{
                      fontSize: 10,
                      paddingInline: 6,
                      paddingBlock: 3,
                      borderRadius: 999,
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            <div
              style={{
                fontSize: 14,
                lineHeight: 1.4,
                marginBottom: 8,
              }}
            >
              {p.text}
            </div>

            <button
              type="button"
              onClick={() => toggleLike(p.id)}
              className="btn ghost"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 12,
                paddingInline: 8,
                borderRadius: 999,
                borderColor: p.liked ? '#3EE0C3' : undefined,
                background: p.liked ? '#123b3a' : 'transparent',
                color: p.liked ? '#3EE0C3' : undefined,
              }}
            >
              <ThumbsUp
                size={14}
                stroke={p.liked ? '#3EE0C3' : '#f8fbff'}
                fill={p.liked ? '#3EE0C3' : 'none'}
              />
              {p.likes}
            </button>
          </div>
        ))}

        {filteredPosts.length === 0 && (
          <p className="small" style={{ opacity: 0.7 }}>
            No posts yet. Be the first to share a view on {sym}.
          </p>
        )}
      </div>
    </div>
  )
}
