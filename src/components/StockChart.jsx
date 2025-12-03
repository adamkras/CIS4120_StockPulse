// StockChart.jsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function StockChart({
  data = [],
  loading,
  error,
  seriesKeys,
}) {
  if (error) {
    return (
      <p className="small" style={{ color: '#FF6B6B', marginTop: 8 }}>
        {error}
      </p>
    );
  }

  if (loading) {
    return (
      <p className="small" style={{ opacity: 0.85, marginTop: 8 }}>
        Loading historical prices…
      </p>
    );
  }

  // If there is no data, just render nothing so the rest of the stock page still shows
  if (!data || data.length === 0) {
    return null;
  }

  const tickFormatter = (value) => {
    const date = new Date(value);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const colors = ['#3EE0C3', '#5B8DEF', '#FFB85C', '#A26BFF', '#FF6B6B'];

  return (
    <div style={{ height: 260, marginTop: 12 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#243256" />
          <XAxis
            dataKey="date"
            tickFormatter={tickFormatter}
            tick={{ fontSize: 10, fill: '#A9B4D8' }}
            axisLine={false}
            tickLine={false}
            minTickGap={20}
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fontSize: 10, fill: '#A9B4D8' }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Tooltip
            contentStyle={{
              background: '#0f1a36',
              border: '1px solid #2a3658',
              borderRadius: 8,
              fontSize: 12,
            }}
            labelFormatter={(value) => `Date: ${value}`}
          />

          {seriesKeys && seriesKeys.length > 0 ? (
            seriesKeys.map((series, idx) => (
              <Line
                key={series.key}
                type="monotone"
                dataKey={series.key}
                stroke={colors[idx % colors.length]}
                strokeWidth={series.isPrimary ? 2 : 1.5}
                dot={false}
                activeDot={{ r: 4 }}
                name={series.label}
              />
            ))
          ) : (
            <Line
              type="monotone"
              dataKey="close"
              stroke="#3EE0C3"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
