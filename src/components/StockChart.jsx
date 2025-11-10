// StockChart.jsx — Responsive line chart for stock price visualization
// - Renders a time series of prices using Recharts
// - Supports dynamic data passed via props or fallback mock data
// - Provides labeled axes, grid lines, tooltips, and responsive layout

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

/**
 * Props:
 *   series: Array<{ time: string, price: number }>
 *     e.g., [{ time: '09:30', price: 142.12 }, ...]
 */
export default function StockChart({ series = [] }) {
  // === Handle Empty Data ===
  // If no data yet (e.g., while loading or on first render),
  // use a short fallback dataset to prevent an empty chart flash.
  const data = series?.length
    ? series
    : [
        { time: '09:30', price: 140.0 },
        { time: '10:00', price: 141.2 },
        { time: '10:30', price: 139.7 },
        { time: '11:00', price: 142.5 },
      ]

  return (
    <div style={{ height: 320 }}>
      {/* === Responsive Chart Container ===
          Ensures the chart scales with parent container width/height */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
        >
          {/* === Grid and Axes === */}
          <CartesianGrid stroke="rgba(255,255,255,0.08)" />
          <XAxis
            dataKey="time"
            tick={{ fill: '#E5EFF7' }} // light axis labels
            tickLine={false}
            axisLine={{ stroke: '#BFD3E0' }}
          />
          <YAxis
            tick={{ fill: '#E5EFF7' }}
            tickLine={false}
            axisLine={{ stroke: '#BFD3E0' }}
            // Expands the domain slightly beyond data range for padding
            domain={['dataMin - 1', 'dataMax + 1']}
          />

          {/* === Tooltip ===
              Displays time and price when hovering over a point */}
          <Tooltip
            contentStyle={{
              background: '#0f1a36',
              border: '1px solid #2a3658',
              borderRadius: 8,
            }}
            labelStyle={{ color: '#BFD3E0' }}
            itemStyle={{ color: '#5BC0BE' }}
          />

          {/* === Price Line ===
              - Smooth curve ('monotone')
              - No visible dots for cleaner appearance
              - Slightly thicker stroke for contrast */}
          <Line
            type="monotone"
            dataKey="price"
            stroke="#5BC0BE"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* === Axis Label Footer === */}
      <div className="small" style={{ marginTop: 6 }}>
        Time (x) vs Price (y)
      </div>
    </div>
  )
}
