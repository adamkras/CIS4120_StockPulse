# StockPulse
***Group Members:*** Adam Krasilovsky, Eesh Trivedi, Brandon Kong  

**StockPulse** is an interactive React web application built with **Vite** that allows users to explore and analyze stock performance in a modern, visually engaging interface.  
Users can **search for stock tickers**, **visualize live or mock price data**, and **participate in real-time discussions** about market sentiment.  

---

## Project Overview
StockPulse blends financial analytics, community sentiment, and personalized dashboards into a cohesive, elegant interface. The app features:

- Real-time price quotes (Finnhub API)
- Historical market performance (Alpha Vantage)
- Persistent discussion boards for each stock
- Favorite tracking, view streaks, and custom profile stats
- Comparison overlays for multiple tickers
- A full design system: consistent color palette, spacing, typography

---

## Key Features
- **Navigation & Routing** – Multi-page app powered by `react-router-dom`, featuring Home, Stock, and Style Guide pages.
- **Stock Visualization** – Responsive, dynamic line chart built with `Recharts`, supporting custom time frames (1 Day / 1 Week / 1 Month / Custom Date Range).
- **Discussion Feed** – Interactive post system with likes, filters, and deletion, simulating a live community feed.
- **Style Guide** – Built-in reference page displaying the app’s color palette, typography, and icons.
- **Responsive Design** – Flexible grid and row layouts ensure usability across device sizes.
- **Accessibility-Friendly Design** – Semantic HTML elements, labeled inputs, and color contrast awareness built into the design.

---

## Design Rationale
**Technology Choice:**  
We used **React with Vite** to leverage fast development builds, modular component structure, and efficient hot reloading.  
Vite’s modern ES module-based architecture ensures that the app loads quickly in production and provides an optimal developer experience.  

**User Interface Philosophy:**  
StockPulse’s UI emphasizes simplicity and cognitive clarity:
- Primary interactions (searching, viewing, discussing) are front-loaded for ease of access.  
- Minimal visual clutter supports System I thinking — quick interpretation of stock trends and sentiments.  
- Color choices (teal for accents, navy backgrounds) create a professional, data-oriented visual tone while maintaining strong contrast for accessibility.  

**Scalability:**  
By separating logic (`hooks/`), visuals (`components/`), and data mocks (`data/`), the app can easily integrate:
- Real-time APIs (e.g., Finnhub, Alpha Vantage)
- User authentication
- Persistent database-backed discussions  

---

## Tech Stack
| Category | Tools & Frameworks |
|-----------|--------------------|
| **Frontend Framework** | React + Vite |
| **Routing** | React Router DOM v7 |
| **Charting Library** | Recharts |
| **Icons** | Lucide React |
| **Styling** | CSS variables + custom utility classes |
| **Languages** | JavaScript (ES6+), JSX, HTML, CSS |

---

## Installation & Setup
```bash
# 1. Clone the repository
git clone https://github.com/yourusername/stockpulse.git
cd stockpulse

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

project-root/
 ├─ index.html
 ├─ package.json
 ├─ vite.config.js
 ├─ styles.css           # Global theme + design system
 ├─ App.css
 │
 └─ src/
     ├─ App.jsx          # Layout + routes
     ├─ main.jsx         # App bootstrap (BrowserRouter)
     │
     ├─ components/
     │   ├─ Navbar.jsx
     │   ├─ Home.jsx
     │   ├─ Stock.jsx              # Live quote + chart + compare + favorites
     │   ├─ StockChart.jsx         # Multi-series chart renderer
     │   ├─ DiscussionFeed.jsx     # Posts, likes, delete, filters
     │   ├─ Profile.jsx            # Full dashboard with analytics
     │   └─ StyleGuide.jsx
     │
     ├─ data/
     │   ├─ finnhub.js             # Finnhub URL builder + key
     │   ├─ alphavantage.js        # AV daily series fetcher
     │   └─ mockPosts.js           # Seed posts for stocks
     │
     ├─ hooks/
     │   ├─ useAlphaDailySeries.js
     │   ├─ useFavorites.js
     │   ├─ useLocalStockSearch.js
     │   └─ useStockData.js
     │
     └─ index.css
```

---

Color Palette:
```bash
--primary:   #0B132B;  /* Background and base color */
--secondary: #1C2541;  /* Card backgrounds, headers */
--accent1:   #5BC0BE;  /* Primary accent and highlights */
--accent2:   #FF6B6B;  /* Alerts and emphasis */
--accent3:   #3A506B;  /* Secondary text and details */
--success:   #27AE60;  /* Positive sentiment (Bullish) */
--error:     #E74C3C;  /* Negative sentiment (Bearish) */
```