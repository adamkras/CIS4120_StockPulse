// useFavorites.js — Global-ish favorite ticker management with localStorage

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'stockpulse:favorites'

export default function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })

  // Persist to localStorage whenever favorites change
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    } catch {
      // ignore quota errors etc.
    }
  }, [favorites])

  const addFavorite = (symbol) => {
    const s = symbol.toUpperCase()
    setFavorites((prev) => (prev.includes(s) ? prev : [...prev, s]))
  }

  const removeFavorite = (symbol) => {
    const s = symbol.toUpperCase()
    setFavorites((prev) => prev.filter((t) => t !== s))
  }

  const toggleFavorite = (symbol) => {
    const s = symbol.toUpperCase()
    setFavorites((prev) =>
      prev.includes(s) ? prev.filter((t) => t !== s) : [...prev, s]
    )
  }

  return { favorites, addFavorite, removeFavorite, toggleFavorite }
}
