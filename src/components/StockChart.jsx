// src/components/StockChart.jsx
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { useStockData } from '../hooks/useStockData'

export default function StockChart({ symbol }) {
  const { data, loading, error } = useStockData(symbol, { resolution: '60', count: 120 })

  if (!symbol) {
    return <div className="chart-empty">Search for a ticker to see its price chart.</div>
  }

  if (loading) {
    return <div className="chart-loading">Loading {symbol.toUpperCase()} data…</div>
  }

  if (error) {
    return (
      <div className="chart-error">
        Couldn’t load real data for <strong>{symbol.toUpperCase()}</strong>.  
        Please check the ticker or try again later.
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="chart-empty">
        No recent price data available for <strong>{symbol.toUpperCase()}</strong>.
      </div>
    )
  }

  return (
    <div className="chart-container">
      <h2 className="chart-title">{symbol.toUpperCase()} Price</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 16, right: 24, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => `$${v.toFixed(2)}`}
          />
          <Tooltip
            formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Price']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#FF7A45" // keep your existing accent color
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
