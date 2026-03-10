# Basketball Live Scores

Real-time basketball scores with minimal latency.

## Features

- Real-time score updates
- Minimal latency
- Mobile-first design
- CDN-optimized static asset delivery

## Tech Stack

- Next.js 16 (App Router)
- TypeScript (strict mode)
- Tailwind CSS v4
- PostgreSQL (Vercel Postgres)
- Redis (Upstash)
- Prisma ORM

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy environment variables:

```bash
cp .env.example .env.local
```

4. Update `.env.local` with your configuration (API keys will be added in Phase 2)

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run prisma:generate` - Generate Prisma client

## Project Structure

```
src/
  app/
    layout.tsx    # Root layout
    page.tsx      # Home page
    globals.css   # Global styles
  lib/
    db.ts         # Prisma client singleton
    cache.ts      # Redis cache wrapper
prisma/
  schema.prisma   # Database schema
```

## Deployment

### Vercel (Production)

1. **Connect GitHub repository:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your Git repository

2. **Create PostgreSQL database:**
   - In Vercel Dashboard, go to Storage tab
   - Create a new Postgres database
   - Connect it to your project (automatically sets DATABASE_URL)

3. **Set up Redis cache:**
   - Create an account at [Upstash](https://upstash.com)
   - Create a new Redis database
   - Copy the connection string and add it to Vercel environment variables as `REDIS_URL`

4. **Deploy:**
   - Push to main branch
   - Vercel automatically builds and deploys
   - GitHub Actions CI runs on all PRs

### CI/CD

- **Continuous Integration:** GitHub Actions runs type-check, lint, and build on all PRs
- **Continuous Deployment:** Vercel automatically deploys on push to main branch
- **Cache Configuration:** Vercel edge network applies optimized cache headers:
  - API routes: 10s cache with 30s stale-while-revalidate
  - Static assets: 1-year immutable cache

### Cache Strategy

The application uses a two-layer caching approach:

1. **Next.js Server Layer** (next.config.ts):
   - Configures cache headers for all environments (dev and production)
   - Ensures consistent caching behavior

2. **Vercel Edge Network** (vercel.json):
   - Production-only CDN optimization
   - Edge headers take precedence over Next.js headers in production
   - Automatically applied at edge locations worldwide

This two-layer approach ensures optimal performance: next.config.ts provides baseline caching for all environments, while vercel.json optimizes the production CDN edge network (PERF-04).

## Performance Optimizations

- Image optimization with AVIF/WebP formats
- 1-year cache headers for static assets (immutable)
- CDN-ready configuration with Vercel edge network
- Multi-tier caching: CDN → Redis → Origin (PERF-03)
- Differentiated TTLs based on data volatility:
  - Live games: 10s
  - Scheduled games: 2min
  - Final scores: 15min
  - Team data: 24h
