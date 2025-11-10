// App.jsx — Root component managing page layout and routing
// - Wraps all pages within a shared container and Navbar
// - Defines routes for Home, StockPage, and StyleGuide
// - Handles parameterized stock routes and 404 redirects

import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './components/Home'
import StockPage from './components/StockPage'
import StyleGuide from './components/StyleGuide' // accessible directly, but not linked in nav

export default function App() {
  return (
    // === Main App Layout ===
    // The container sets global margins/padding and centers the app content.
    <div className="container">
      {/* === Persistent Navigation Bar === */}
      <Navbar />

      {/* === Application Routes ===
          Uses React Router v6+ syntax for declarative routing. */}
      <Routes>
        {/* Home Page (default landing route) */}
        <Route path="/" element={<Home />} />

        {/* Stock Page (default symbol: NVDA)
            Allows quick testing of the component without parameters. */}
        <Route path="/stock" element={<StockPage symbol="NVDA" />} />

        {/* Parameterized Stock Route
            Example: /stock/AAPL dynamically displays data for that symbol. */}
        <Route path="/stock/:symbol" element={<StockPage />} />

        {/* Hidden route for design documentation (Style Guide)
            Used for internal reference and grading (not visible in Navbar). */}
        <Route path="/style" element={<StyleGuide />} />

        {/* Fallback route — redirects any unknown URL back to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
