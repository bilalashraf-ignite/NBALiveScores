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
- PostgreSQL (planned)
- Redis (planned)

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

## Project Structure

```
src/
  app/
    layout.tsx    # Root layout
    page.tsx      # Home page
    globals.css   # Global styles
```

## Performance Optimizations

- Image optimization with AVIF/WebP formats
- 1-year cache headers for static assets
- CDN-ready configuration
