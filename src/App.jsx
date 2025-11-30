// App.jsx — Root component managing page layout and routing
// - Wraps all pages within a shared container and Navbar
// - Defines routes for Home, StockPage, Discussion, Profile, StyleGuide
// - Shares "favorites" state so StockPage can toggle and Home can display

import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './components/Home'
import StockPage from './components/StockPage'
import StyleGuide from './components/StyleGuide'
import Profile from './components/Profile'
import DiscussionFeed from './components/DiscussionFeed'
import useFavorites from './hooks/useFavorites'

export default function App() {
  const { favorites, toggleFavorite } = useFavorites()

  return (
    <div className="container">
      <Navbar />

      <Routes>
        {/* Home gets the list of favorite symbols */}
        <Route path="/" element={<Home favoriteSymbols={favorites} />} />

        {/* Stock pages can toggle the current symbol as a favorite */}
        <Route
          path="/stock"
          element={
            <StockPage
              symbol="NVDA"
              favoriteSymbols={favorites}
              onToggleFavorite={toggleFavorite}
            />
          }
        />
        <Route
          path="/stock/:symbol"
          element={
            <StockPage
              favoriteSymbols={favorites}
              onToggleFavorite={toggleFavorite}
            />
          }
        />

        <Route path="/discussion" element={<DiscussionFeed />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/style" element={<StyleGuide />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
