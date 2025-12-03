const AV_BASE = 'https://www.alphavantage.co/query';

const AV_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY;
export const HAS_ALPHA_VANTAGE_KEY = !!AV_KEY;

export function buildAlphaUrl(params) {
  if (!AV_KEY) return null;
  const qs = new URLSearchParams({ ...params, apikey: AV_KEY });
  return `${AV_BASE}?${qs.toString()}`;
}

export async function getDailySeries(symbol) {
  if (!HAS_ALPHA_VANTAGE_KEY) {
    throw new Error('Alpha Vantage API key not configured');
  }

  const url = buildAlphaUrl({
    function: 'TIME_SERIES_DAILY',
    symbol,
    outputsize: 'compact',
  });

  if (!url) throw new Error('Missing API key');

  const res = await fetch(url);
  if (!res.ok) throw new Error('Network error');

  const json = await res.json();

  if (json['Error Message']) {
    throw new Error('Invalid symbol or request.');
  }
  if (json.Note) {
    throw new Error('API rate limit reached. Try again later.');
  }

  const raw = json['Time Series (Daily)'];
  if (!raw) throw new Error('Unexpected response format');

  const parsed = Object.entries(raw).map(([date, values]) => ({
    date,
    open: parseFloat(values['1. open']),
    high: parseFloat(values['2. high']),
    low: parseFloat(values['3. low']),
    close: parseFloat(values['4. close']),
    volume: parseFloat(values['5. volume']),
  }));

  parsed.sort((a, b) => new Date(a.date) - new Date(b.date));
  return parsed;
}