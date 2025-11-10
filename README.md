# StockPulse
***Group Members:*** Adam Krasilovsky, Eesh Trivedi, Brandon Kong  

**StockPulse** is an interactive React web application built with **Vite** that allows users to explore and analyze stock performance in a modern, visually engaging interface.  
Users can **search for stock tickers**, **visualize live or mock price data**, and **participate in real-time discussions** about market sentiment.  

The app combines **data visualization**, **social interactivity**, and **clean UI design**, demonstrating an understanding of **React architecture**, **UI/UX principles**, and **frontend performance optimization**.  

---

## Project Overview
StockPulse was designed to emulate a lightweight, community-driven stock analysis platform — blending **financial visualization** with **social engagement**.  

Key design goals:
- **Clarity:** Use of consistent fonts, spacing, and alignment for a clean, readable layout.  
- **Feedback:** Interactive visual cues like hover states, tooltips, and like buttons provide immediate user feedback.  
- **Consistency:** Centralized color and font management through CSS variables in `styles.css`.  
- **Scalability:** Modular React components that can be easily expanded with live data and authentication.  

---

## Key Features
- **Navigation & Routing** – Multi-page app powered by `react-router-dom`, featuring Home, Stock, and Style Guide pages.
- **Stock Visualization** – Responsive, dynamic line chart built with `Recharts`, supporting custom time frames (1 Day / 1 Week / 1 Month / Custom Date Range).
- **Discussion Feed** – Interactive post system with likes, filters, and deletion, simulating a live community feed.
- **Style Guide Page** – Built-in reference page displaying the app’s color palette, typography, and icons.
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

## 🛠️ Tech Stack
| Category | Tools & Frameworks |
|-----------|--------------------|
| **Frontend Framework** | React + Vite |
| **Routing** | React Router DOM v7 |
| **Charting Library** | Recharts |
| **Icons** | Lucide React |
| **Styling** | CSS variables + custom utility classes |
| **Languages** | JavaScript (ES6+), JSX, HTML, CSS |

> Optional: Add a `.env` file with a Finnhub API key to enable live quote data:  
> `VITE_FINNHUB_KEY=your_api_key_here`  
> The app automatically falls back to mock data if unavailable.

---

## ⚙️ Installation & Setup
```bash
# 1. Clone the repository
git clone https://github.com/yourusername/stockpulse.git
cd stockpulse

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

project-root/
 ├─ index.html              # Entry HTML file; loads React app (Vite root)
 ├─ package.json            # Project dependencies and scripts
 ├─ vite.config.js          # Vite configuration (if customized)
 ├─ README.md               # Documentation (this file)
 ├─ App.css                 # Legacy Vite styles (kept for fallback)
 ├─ styles.css              # Global app theme and component utilities
 │
 └─ src/
     ├─ components/
     │   ├─ Navbar.jsx          # Header bar with app logo, navigation, and profile icon
     │   ├─ Home.jsx            # Landing page with ticker search + trending stocks
     │   ├─ StockPage.jsx       # Core view for price chart + discussion feed
     │   ├─ StockChart.jsx      # Responsive line chart built with Recharts
     │   ├─ DiscussionFeed.jsx  # User discussion posts, likes, filters, and deletion
     │   └─ StyleGuide.jsx      # Visual reference for colors, fonts, and icons
     │
     ├─ data/
     │   ├─ mockPosts.js        # Sample discussion data
     │   └─ mockPrices.js       # Synthetic price data generator (supports multiple ranges)
     │
     ├─ hooks/
     │   └─ useStockData.js     # Custom hook to fetch or mock stock data dynamically
     │
     ├─ App.jsx                 # Main routing and layout shell
     ├─ main.jsx                # React entry point wrapped in BrowserRouter
     └─ styles.css              # Core design system (palette, grid, components)
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