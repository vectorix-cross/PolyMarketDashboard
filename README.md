# Vectorix Polymarket dashboard (Gamma Analytics)

**Vectorix (`vectorix-cross`)** — React / TypeScript desk for scanning Polymarket: volume, liquidity, categories, watchlist, and price alerts.

**Live:** [https://polymarketanalytics.com/](https://polymarketanalytics.com/)

Gamma is the public market catalog. This app polls it, caches on the server, and draws category mix, 24h volume, and closing-soon boards. Watchlists and alerts persist in the browser (LocalStorage). No wallet, no custody.

| Channel | Link |
|---------|------|
| **Email** | [vanjasretenovic4@gmail.com](mailto:vanjasretenovic4@gmail.com) |
| **Telegram** | [@vectoris_corss](https://t.me/vectoris_corss) |
| **Discord** | [vectorix-cross](https://discord.com/users/775389898794336316) |
| **X** | [@vectorix_cross](https://x.com/vectorix_cross) |
| **GitHub** | [vectorix-cross/PolyMarketDashboard](https://github.com/vectorix-cross/PolyMarketDashboard) |
| **Portfolio** | [Featured projects](https://github.com/vectorix-cross/portfolio) |

## Features

### Analytics and Visualization
- Real-time market data with 10-second auto-refresh
- Key metrics dashboard: Active markets, 24h volume, top probabilities, average liquidity
- Beautiful gradient charts: Donut chart (8 categories), sparkline trends, liquidity bubble chart
- Global market sentiment analysis with probability distribution
- Closing soon markets (30-day window) and high activity tracking

### Market Exploration
- Advanced search and filtering by category, status, and keywords
- Market detail pages with outcome probabilities and metadata
- Smart category inference from market questions (Crypto, Tech, Sports, Business, etc.)
- Color-coded market sentiment indicators

### Watchlist (Ready for Release)
- One-click add/remove markets to personal watchlist
- Dedicated watchlist page showing all tracked markets with live data
- Remove individual markets or clear entire watchlist
- Browser LocalStorage persistence (no login required)
- Displays: current probability, category, liquidity for each watched market

### Price Alerts (Ready for Release)
- Create custom price alerts with "Above" or "Below" conditions
- Set probability thresholds (e.g., notify when market >75%)
- Toggle alerts on/off individually
- Alert management dashboard with all active alerts
- Browser LocalStorage storage (privacy-first)
- Note: UI complete, backend notification service can be added for active monitoring

### Beautiful UI/UX
- Glass morphism design with neon gradient accents
- Dark mode: Rich purple-blue gradient (not pure black)
- Light mode: Warm peachy tones (comfortable, not harsh)
- Animated color-coded logo: Green (bullish), Red (bearish), Purple-cyan (neutral)
- Interactive tooltips showing live market status on logo hover
- Responsive design for all screen sizes
- Theme toggle with localStorage persistence

## Tech Stack

### Frontend
- React 19 with TypeScript
- Vite for fast development and optimized builds
- Tailwind CSS for styling
- shadcn/ui components (built on Radix UI)
- TanStack Query for data fetching and caching
- Wouter for client-side routing
- Recharts for data visualization

### Backend
- Express.js server in TypeScript
- API proxy for Polymarket's public APIs
- In-memory LRU caching (5-minute TTL)
- Rate limiting (60 requests/minute per IP)
- Zod schemas for data validation

### Database
- Neon Serverless PostgreSQL
- Drizzle ORM for type-safe database operations
- Prepared for authentication and persistent data storage

### External APIs
- Polymarket Gamma Markets API for real-time prediction market data

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/vectorix-cross/PolyMarketDashboard.git
cd PolyMarketDashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL=your_neon_database_url
SESSION_SECRET=your_session_secret
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to:
```
http://localhost:5000
```

## Available Scripts

- `npm run dev` - Start development server (backend + frontend)
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes

## Project Structure

```
pm-intelligence/
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utility functions
│   │   ├── pages/       # Page components
│   │   ├── App.tsx      # Main app component
│   │   └── index.css    # Global styles
│   └── public/          # Static assets
├── server/              # Backend Express server
│   ├── lib/            # Server utilities (cache, rate-limit)
│   ├── index.ts        # Server entry point
│   ├── routes.ts       # API routes
│   └── storage.ts      # Database interface
├── shared/             # Shared types and schemas
│   ├── api-schemas.ts  # API validation schemas
│   └── schema.ts       # Database schemas
└── package.json        # Project dependencies
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub (see instructions below)

2. Go to [vercel.com](https://vercel.com) and sign in

3. Click "New Project"

4. Import your GitHub repository

5. Configure environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `NODE_ENV=production`

6. Click "Deploy"

Vercel will automatically detect your build settings and deploy your application.

### Alternative: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Market Status Indicators

The dashboard uses a simple system to show market sentiment:

- **Bullish (Green)**: Average market probability > 55%
- **Bearish (Red)**: Average market probability < 45%
- **Neutral (Purple)**: Average market probability 45-55%

You can see this status in two places:
1. Logo tooltip (hover over the Polymarket icon)
2. Global Market Sentiment card on the Overview page

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Acknowledgments

Public market data from [Polymarket](https://polymarket.com) Gamma. Custom screens, alerts webhooks, or a white-label desk: use the contact table.
