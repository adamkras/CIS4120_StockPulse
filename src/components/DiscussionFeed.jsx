// DiscussionFeed.jsx — Minimal discussion UI with filters, composer, likes (toggle), and delete
// - Displays a list of posts (mock + user-submitted)
// - Lets users filter by tag, like/unlike posts, and delete their own posts (@you)

import { useMemo, useState } from 'react'
import { mockPosts as initialPosts } from '../data/mockPosts'
import { ThumbsUp, Send, Filter } from 'lucide-react'

// Category tabs (used to filter the visible post list)
const TAGS = ['All', 'Bullish', 'Bearish']

export default function DiscussionFeed() {
  // === UI/Filter state ===
  const [active, setActive] = useState('All')         // which tab is selected
  // === Data state ===
  const [posts, setPosts] = useState(initialPosts)    // visible post list
  // === Composer state ===
  const [text, setText] = useState('')                // text input for new post
  const [tag, setTag] = useState('Bullish')           // tag for new post
  // Track which posts are liked by the current user (for toggle behavior + aria)
  const [likedIds, setLikedIds] = useState(new Set())

  // === Derived list according to active filter ===
  const filtered = useMemo(() => {
    return active === 'All' ? posts : posts.filter(p => p.tag === active)
  }, [active, posts])

  // === Handlers ===

  // Submit handler: prepend a new post to the feed
  const submit = (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    const p = {
      id: crypto.randomUUID(),
      user: '@you',
      minutesAgo: 0,   // could be swapped for a timestamp -> "time ago" formatter
      likes: 0,
      tag,
      body: trimmed,
    }
    setPosts([p, ...posts])
    setText('')
  }

  // Toggle like/unlike for a post id
  const like = (id) => {
    // Update like count in posts
    setPosts(ps => ps.map(p => {
      if (p.id !== id) return p
      const isLiked = likedIds.has(id)
      return { ...p, likes: Math.max(0, isLiked ? p.likes - 1 : p.likes + 1) }
    }))
    // Update local likedIds set
    setLikedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Remove a post by id (only for posts authored by '@you')
  const deletePost = (id) => {
    setPosts(ps => ps.filter(p => p.id !== id))
    // Keep likedIds clean if the post was liked
    setLikedIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  // === Render ===
  return (
    <div>
      {/* Header with a small "filters" affordance */}
      <div className="space-between">
        <h3>Live Discussion</h3>
        <div className="row small"><Filter size={14}/> filters</div>
      </div>

      {/* Tabs for All / Bullish / Bearish */}
      <div className="tabs" style={{marginTop: 8}} role="tablist" aria-label="Discussion filters">
        {TAGS.map(t => (
          <div
            key={t}
            role="tab"
            tabIndex={0}
            aria-selected={active === t}
            className={`tab ${active === t ? 'active' : ''}`}
            onClick={() => setActive(t)}
            onKeyDown={(e) => e.key === 'Enter' && setActive(t)}
          >
            {t}
          </div>
        ))}
      </div>

      {/* Composer (tag select + text input + Post button) */}
      <form onSubmit={submit} className="row" style={{gap: 8, marginBottom: 12}}>
        <label className="small" htmlFor="post-tag" style={{position:'absolute', left:-9999}}>Tag</label>
        <select
          id="post-tag"
          className="input"
          style={{maxWidth: 120}}
          value={tag}
          onChange={e => setTag(e.target.value)}
        >
          <option>Bullish</option>
          <option>Bearish</option>
        </select>

        <label className="small" htmlFor="post-text" style={{position:'absolute', left:-9999}}>Post text</label>
        <input
          id="post-text"
          className="input"
          placeholder="Write your post…"
          value={text}
          onChange={e => setText(e.target.value)}
        />

        <button className="btn" type="submit" aria-label="Publish post">
          <Send size={16}/> Post
        </button>
      </form>

      {/* Post list */}
      {filtered.map(p => (
        <article key={p.id} className="post" aria-live="polite">
          <div className="space-between">
            {/* Author + tag + timestamp */}
            <div className="meta">
              <strong>{p.user}</strong>
              <span className={`tag ${p.tag}`}> {p.tag}</span>
              <span> • {p.minutesAgo}m ago</span>
            </div>

            {/* Actions: like toggle + (if owner) delete */}
            <div className="row small">
              <button
                type="button"
                onClick={() => like(p.id)}
                className={`btn ghost ${likedIds.has(p.id) ? 'active' : ''}`}
                style={{padding:'6px 10px'}}
                title="Like"
                aria-pressed={likedIds.has(p.id)}
              >
                <ThumbsUp size={14} /> {p.likes}
              </button>

              {p.user === '@you' && (
                <button
                  type="button"
                  onClick={() => deletePost(p.id)}
                  className="btn ghost"
                  style={{padding:'6px 10px', marginLeft: 8}}
                  title="Delete post"
                  aria-label="Delete your post"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Body */}
          <div style={{marginTop: 6}}>{p.body}</div>
        </article>
      ))}
    </div>
  )
}
