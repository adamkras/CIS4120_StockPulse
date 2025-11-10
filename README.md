# StockPulse
***Group Members:*** Adam Krasilovsky, Eesh Trivedi, Brandon Kong

**StockPulse** is an interactive React web app built with **Vite** that lets users search for stock tickers, visualize live price data, and join real-time discussion feeds.  
It demonstrates **navigation and routing**, **dynamic chart rendering**, and **user-generated content** — perfect for a modern, data-driven UI demo.

---

## Features
- **Navigation & Routing:** Multi-page app using `react-router-dom`
- **Live Stock Visualization:** Responsive line chart built with `Recharts`
- **Discussion Feed:** Interactive posts with likes and filters
- **Modern UI:** Styled with Lucide icons, consistent color and font system
- **Responsive Design:** Adapts to any screen size seamlessly

---

## Tech Stack
- **Frontend:** React + Vite  
- **Routing:** React Router DOM v7  
- **Charts:** Recharts  
- **Icons:** Lucide React  
- **Languages:** JavaScript (ES6), JSX, HTML, CSS

---

## Installation & Setup
```bash
# 1. Clone the repository
git clone https://github.com/yourusername/stockpulse.git
cd stockpulse

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

---

src/
 ├─ components/
 │   ├─ Navbar.jsx          # Top navigation (brand + route buttons)
 │   ├─ Home.jsx            # Landing page with search + trending tickers
 │   ├─ StockPage.jsx       # Stock view (badge + chart + discussion)
 │   ├─ StockChart.jsx      # Recharts line chart (responsive + tooltips)
 │   ├─ DiscussionFeed.jsx  # Post composer, filters, likes
 │   └─ StyleGuide.jsx      # Colors, fonts, icon set (Lucide)
 ├─ data/
 │   ├─ mockPosts.js        # Sample posts for discussion
 │   └─ mockPrices.js       # Mock intraday generator
 ├─ hooks/
 │   └─ useStockData.js     # Tries live quote; falls back to mock series
 ├─ App.jsx                 # Routes and page shell
 ├─ main.jsx                # React entry + BrowserRouter
 └─ styles.css              # Global styling (palette, layout, utilities)