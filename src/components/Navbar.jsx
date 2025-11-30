// Navbar.jsx — App header with brand title and navigation links

import { LineChart, User } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const { pathname } = useLocation()

  const isHome = pathname === '/'
  const isStock = pathname.startsWith('/stock')
  const isProfile = pathname.startsWith('/profile')

  return (
    <div className="header">
      {/* Brand / Logo */}
      <div className="row" style={{ alignItems: 'center', gap: 8 }}>
        <LineChart size={22} />
        <h1>StockPulse</h1>
      </div>

      {/* Nav buttons */}
      <div className="row" style={{ gap: 14 }}>
        <NavButton to="/" active={isHome}>
          Home
        </NavButton>

        <NavButton to="/stock" active={isStock}>
          Stock
        </NavButton>

        {/* Profile icon now routes to /profile */}
        <Link
          to="/profile"
          className="btn ghost"
          style={{
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderColor: isProfile ? '#4fd1c5' : undefined,
            background: isProfile ? 'rgba(79, 209, 197, 0.08)' : 'transparent',
          }}
          title="Profile"
          aria-label="User profile"
          aria-current={isProfile ? 'page' : undefined}
        >
          <User size={20} strokeWidth={2.2} />
        </Link>
      </div>
    </div>
  )
}

function NavButton({ to, active, children }) {
  return (
    <Link
      to={to}
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
