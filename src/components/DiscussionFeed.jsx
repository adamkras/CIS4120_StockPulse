import { useMemo, useState } from 'react'
import { mockPosts as initialPosts } from '../data/mockPosts'
import { ThumbsUp, Send, Filter } from 'lucide-react'

const TAGS = ['All', 'Bullish', 'Bearish']

export default function DiscussionFeed() {
  const [active, setActive] = useState('All')
  const [posts, setPosts] = useState(initialPosts)
  const [text, setText] = useState('')
  const [tag, setTag] = useState('Bullish')
  const [likedIds, setLikedIds] = useState(new Set())

  const filtered = useMemo(() => {
    return active === 'All' ? posts : posts.filter(p => p.tag === active)
  }, [active, posts])

  const submit = (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    const p = {
      id: crypto.randomUUID(),
      user: '@you',
      minutesAgo: 0,
      likes: 0,
      tag,
      body: trimmed,
    }
    setPosts([p, ...posts])
    setText('')
  }

  const like = (id) => {
    setPosts(ps => ps.map(p => {
      if (p.id !== id) return p
      const isLiked = likedIds.has(id)
      return { ...p, likes: isLiked ? p.likes - 1 : p.likes + 1 }
    }))
    setLikedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const deletePost = (id) => {
    setPosts(ps => ps.filter(p => p.id !== id))
    // also clean up likedIds if present
    setLikedIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  return (
    <div>
      <div className="space-between">
        <h3>Live Discussion</h3>
        <div className="row small"><Filter size={14}/> filters</div>
      </div>

      <div className="tabs" style={{marginTop: 8}}>
        {TAGS.map(t => (
          <div
            key={t}
            className={`tab ${active === t ? 'active' : ''}`}
            onClick={() => setActive(t)}
          >{t}</div>
        ))}
      </div>

      <form onSubmit={submit} className="row" style={{gap: 8, marginBottom: 12}}>
        <select
          className="input"
          style={{maxWidth: 120}}
          value={tag}
          onChange={e => setTag(e.target.value)}
        >
          <option>Bullish</option>
          <option>Bearish</option>
        </select>
        <input
          className="input"
          placeholder="Write your post…"
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button className="btn" type="submit"><Send size={16}/> Post</button>
      </form>

      {filtered.map(p => (
        <article key={p.id} className="post">
          <div className="space-between">
            <div className="meta">
              <strong>{p.user}</strong>
              <span className={`tag ${p.tag}`}> {p.tag}</span>
              <span> • {p.minutesAgo}m ago</span>
            </div>
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
                >
                  Delete
                </button>
              )}
            </div>
          </div>
          <div style={{marginTop: 6}}>{p.body}</div>
        </article>
      ))}
    </div>
  )
}
