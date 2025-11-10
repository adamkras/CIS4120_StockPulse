// Navbar.jsx — App header with brand title and navigation links
// - Displays the app logo/name ("StockPulse")
// - Provides navigation buttons for Home and Stock pages
// - Includes a placeholder Profile icon button (non-functional, for future user features)

import { LineChart, User } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  // === Router location ===
  // useLocation() gives access to the current URL path to mark the active tab
  const { pathname } = useLocation()

  return (
    <div className="header">
      {/* === Brand / Logo Section === */}
      <div className="row" style={{ alignItems: 'center', gap: 8 }}>
        {/* Lucide LineChart icon used as a lightweight logo */}
        <LineChart size={22} />
        <h1>StockPulse</h1>
      </div>

      {/* === Navigation Section === */}
      <div className="row" style={{ gap: 14 }}>
        {/* Link to Home (active when pathname === "/") */}
        <NavButton to="/" active={pathname === '/'}>
          Home
        </NavButton>

        {/* Link to Stock (active when pathname starts with "/stock") */}
        <NavButton to="/stock" active={pathname.startsWith('/stock')}>
          Stock
        </NavButton>

        {/* === Profile Icon Button ===
            Placeholder for user profile or login in future versions.
            Currently non-interactive, purely decorative. */}
        <button
          className="btn ghost"
          style={{
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Profile"
          aria-label="User profile"
        >
          <User size={20} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  )
}

// === Reusable NavButton component ===
// Wraps a <Link> styled as a button; highlights the active route.
function NavButton({ to, active, children }) {
  return (
    <Link
      to={to}
      // Use 'ghost' style when inactive for visual hierarchy
      className={`btn ${active ? '' : 'ghost'}`}
      style={{
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-current={active ? 'page' : undefined}
    >
      {children}
    </Link>
  )
}
