// StyleGuide.jsx — Internal reference for StockPulse’s design system
// - Displays app color palette, font styles, and iconography
// - Serves as a developer guide for maintaining visual consistency
// - Not part of the main navigation, but accessible via /style route

import { User, Camera, Square, Plus, X } from 'lucide-react'

export default function StyleGuide() {
  return (
    <div>
      {/* === Page Title === */}
      <h2>Style Guide</h2>
      <p className="small">
        Overview of colors, typography, and icons used across StockPulse.
      </p>

      {/* === Color Palette Section === */}
      <section style={{ marginTop: 16 }}>
        <h3>Color Scheme</h3>
        <p className="small">
          Each color maps to a CSS variable defined in <code>styles.css</code>.
        </p>

        {/* Color swatches for quick visual reference */}
        <div
          className="row"
          style={{ flexWrap: 'wrap', gap: 12, marginTop: 8 }}
        >
          {[
            ['Primary', '--primary'],
            ['Secondary', '--secondary'],
            ['Accent 1', '--accent1'],
            ['Accent 2', '--accent2'],
            ['Accent 3', '--accent3'],
            ['Success', '--success'],
            ['Error', '--error'],
          ].map(([label, varname]) => (
            <Swatch key={label} label={label} cssVar={varname} />
          ))}
        </div>
      </section>

      {/* === Font Styles Section === */}
      <section style={{ marginTop: 20 }}>
        <h3>Fonts</h3>
        <p className="small">
          Headers use <strong>Outfit</strong>; body text uses <strong>Inter</strong>.
          Both are imported from Google Fonts in <code>index.html</code>.
        </p>

        <div
          className="row"
          style={{ gap: 24, alignItems: 'flex-end', marginTop: 8 }}
        >
          {/* Outfit font examples */}
          <div>
            <div
              style={{
                fontFamily: 'Outfit',
                fontWeight: 700,
                fontSize: 24,
              }}
            >
              Outfit 700 (Headers)
            </div>
            <div
              style={{
                fontFamily: 'Outfit',
                fontWeight: 500,
                fontSize: 18,
              }}
            >
              Outfit 500
            </div>
          </div>

          {/* Inter font examples */}
          <div>
            <div
              style={{
                fontFamily: 'Inter',
                fontWeight: 600,
                fontSize: 20,
              }}
            >
              Inter 600
            </div>
            <div
              style={{
                fontFamily: 'Inter',
                fontWeight: 400,
                fontSize: 16,
              }}
            >
              Inter 400 (Body)
            </div>
          </div>
        </div>
      </section>

      {/* === Iconography Section === */}
      <section style={{ marginTop: 20 }}>
        <h3>Iconography (Lucide)</h3>
        <p className="small">
          All icons are imported from <code>lucide-react</code> for a consistent,
          lightweight vector style.
        </p>

        {/* Example icon set */}
        <div className="row" style={{ gap: 18, marginTop: 8 }}>
          <X />
          <User />
          <Camera />
          <Square />
          <Plus />
        </div>
      </section>
    </div>
  )
}

// === Swatch Component ===
// Renders a labeled color sample using a CSS variable
function Swatch({ label, cssVar }) {
  return (
    <div style={{ width: 130 }}>
      <div
        style={{
          width: '100%',
          height: 48,
          borderRadius: 10,
          background: `var(${cssVar})`,
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        aria-label={`${label} color swatch`}
      />
      <div className="small" style={{ marginTop: 6 }}>
        {label}
      </div>
    </div>
  )
}
