import { useEffect, useState } from 'react';
import { buildAlphaUrl, HAS_ALPHA_VANTAGE_KEY } from '../data/alphavantage';

export default function useAlphaDailySeries(symbol) {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!symbol) return;
    if (!HAS_ALPHA_VANTAGE_KEY) {
      setError('Add VITE_ALPHA_VANTAGE_KEY to enable the historical chart.');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');
    setSeries([]);

    const fetchDaily = async () => {
      try {
        const url = buildAlphaUrl({
          function: 'TIME_SERIES_DAILY',
          symbol,
          outputsize: 'compact', // last 100 days
        });
        if (!url) throw new Error('Missing API key');

        const res = await fetch(url);
        if (!res.ok) throw new Error('Network error');

        const json = await res.json();

        // Alpha Vantage rate limit / error messages
        if (json['Error Message']) {
          throw new Error('Alpha Vantage: bad symbol or request.');
        }
        if (json.Note) {
          throw new Error('Alpha Vantage rate limit reached. Try again later.');
        }

        const raw = json['Time Series (Daily)'];
        if (!raw) throw new Error('Unexpected Alpha Vantage response.');

        const parsed = Object.entries(raw).map(([date, values]) => ({
          date,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseFloat(values['5. volume']),
        }));

        // Oldest → newest
        parsed.sort((a, b) => new Date(a.date) - new Date(b.date));

        if (!cancelled) setSeries(parsed);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError(e.message || 'Could not load historical data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDaily();

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  return { series, loading, error };
}
