# Architecture Research

**Domain:** Live Basketball Scores Website
**Researched:** 2026-03-10
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   UI         │  │  State       │  │  WebSocket   │              │
│  │   Components │  │  Management  │  │  Client      │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                 │                       │
│         └─────────────────┴─────────────────┘                       │
│                           ▼                                         │
├─────────────────────────────────────────────────────────────────────┤
│                         CDN LAYER                                    │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Static Assets Cache (CSS, JS, Images)                       │   │
│  │  Short-TTL Cache (5-30s for near-realtime data)              │   │
│  └──────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│                      APPLICATION LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │  API        │  │  Data       │  │  ML         │                 │
│  │  Gateway    │  │  Aggregator │  │  Prediction │                 │
│  │             │  │             │  │  Service    │                 │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                 │
│         │                │                │                         │
├─────────┴────────────────┴────────────────┴─────────────────────────┤
│                       DATA LAYER                                     │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │  External   │  │  Cache      │  │  Database   │                 │
│  │  Sports API │  │  (Redis)    │  │  (App Data) │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **UI Components** | Render scores, game details, predictions; handle user interactions | React/Vue components with responsive design |
| **State Management** | Manage application state for scores, game status, user preferences | Context API, Redux, or Zustand for React |
| **WebSocket Client** | Maintain persistent connection for real-time updates | WebSocket API or Socket.io client |
| **CDN Layer** | Cache static assets and short-lived API responses at edge locations | CloudFlare, CloudFront, or Fastly |
| **API Gateway** | Route requests, handle authentication, rate limiting | Express.js, Fastify, or AWS API Gateway |
| **Data Aggregator** | Poll external APIs, normalize data, handle retries and errors | Node.js service with scheduled jobs |
| **ML Prediction Service** | Generate game predictions using historical/real-time data | Python service with scikit-learn/TensorFlow |
| **External Sports API** | Provide real-time scores and game data | Free APIs like balldontlie.io, API-Basketball |
| **Cache (Redis)** | Store frequently accessed data with TTL to reduce API calls | Redis with 5-120 second TTLs for live data |
| **Database** | Persist historical data, predictions, team/player stats | PostgreSQL or MongoDB for flexibility |

## Recommended Project Structure

```
basketball-scores/
├── frontend/              # Client application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── ScoreCard/
│   │   │   ├── GameDetail/
│   │   │   └── PredictionPanel/
│   │   ├── pages/         # Page-level components
│   │   │   ├── Home/
│   │   │   ├── GameDetail/
│   │   │   └── LeagueView/
│   │   ├── hooks/         # Custom React hooks
│   │   │   ├── useWebSocket.ts
│   │   │   └── useScoreData.ts
│   │   ├── services/      # API client services
│   │   │   └── api.ts
│   │   └── state/         # State management
│   │       ├── scoreStore.ts
│   │       └── types.ts
│   └── public/            # Static assets
│
├── backend/               # Application server
│   ├── src/
│   │   ├── api/           # REST API endpoints
│   │   │   ├── scores/
│   │   │   ├── games/
│   │   │   └── predictions/
│   │   ├── services/      # Business logic
│   │   │   ├── dataAggregator.ts
│   │   │   ├── cacheManager.ts
│   │   │   └── apiClient.ts
│   │   ├── websocket/     # WebSocket server
│   │   │   └── scoreUpdates.ts
│   │   ├── models/        # Data models
│   │   └── utils/         # Shared utilities
│   └── tests/
│
├── ml-service/            # Prediction service
│   ├── src/
│   │   ├── models/        # ML model definitions
│   │   ├── features/      # Feature engineering
│   │   ├── pipeline/      # Data processing pipeline
│   │   └── api/           # REST API for predictions
│   └── notebooks/         # Jupyter notebooks for experimentation
│
└── infrastructure/        # Deployment configs
    ├── docker/
    └── scripts/
```

### Structure Rationale

- **frontend/:** Separate client concerns from backend; enables independent deployment and optimization
- **backend/:** Centralizes API aggregation, caching logic, and WebSocket management; acts as intermediary between frontend and external APIs
- **ml-service/:** Isolates prediction logic as separate service; allows independent scaling and updates; Python environment separated from Node.js backend
- **infrastructure/:** Contains deployment configurations for consistent environments

## Architectural Patterns

### Pattern 1: Backend for Frontend (BFF)

**What:** Dedicated backend service optimized specifically for frontend needs, handling API aggregation, data transformation, and caching

**When to use:** When frontend needs differ from general API structure; when aggregating multiple external APIs; when adding caching layer between frontend and third-party services

**Trade-offs:**
- **Pros:** Optimizes data shape for UI; centralizes rate limit handling; simplifies frontend code; enables server-side caching
- **Cons:** Adds backend maintenance overhead; increases deployment complexity for small projects

**Example:**
```typescript
// Backend aggregates multiple API calls into single endpoint
app.get('/api/live-games', async (req, res) => {
  // Check cache first
  const cached = await redis.get('live-games');
  if (cached) return res.json(JSON.parse(cached));

  // Aggregate from multiple sources
  const [nbaGames, ncaaGames] = await Promise.all([
    externalAPI.getNBAGames(),
    externalAPI.getNCAAGames()
  ]);

  // Transform and combine
  const allGames = [...nbaGames, ...ncaaGames].map(normalizeGame);

  // Cache with short TTL
  await redis.setex('live-games', 10, JSON.stringify(allGames));

  res.json(allGames);
});
```

### Pattern 2: Intelligent Polling with Adaptive Intervals

**What:** Dynamic polling strategy that adjusts request frequency based on game state (scheduled, live, final)

**When to use:** When using free APIs with rate limits; when update frequency can vary by game state; when minimizing unnecessary API calls

**Trade-offs:**
- **Pros:** Reduces API calls by 70-80%; respects rate limits; provides timely updates when needed
- **Cons:** Adds complexity to polling logic; requires game state tracking

**Example:**
```typescript
class AdaptivePoller {
  private intervals = {
    scheduled: 30000,  // 30s when game scheduled
    live: 5000,        // 5s during live game
    final: 300000      // 5m after game ends
  };

  async pollGame(gameId: string) {
    const game = await this.fetchGame(gameId);
    const interval = this.intervals[game.status];

    setTimeout(() => this.pollGame(gameId), interval);

    // Push update via WebSocket
    this.broadcast('game-update', game);
  }
}
```

### Pattern 3: Multi-Tier Caching

**What:** Layered caching strategy using CDN, Redis, and in-memory caching with different TTLs based on data volatility

**When to use:** High traffic scenarios; when protecting backend from load spikes; when serving global audience

**Trade-offs:**
- **Pros:** Reduces origin requests by 90%+; improves response times globally; handles traffic spikes
- **Cons:** Cache invalidation complexity; slightly stale data (acceptable for 5-30s TTL)

**Example:**
```typescript
// Three-tier cache hierarchy
async function getScores(league: string) {
  // L1: In-memory (1s TTL)
  if (memCache.has(league) && !memCache.isExpired(league)) {
    return memCache.get(league);
  }

  // L2: Redis (10s TTL)
  const redisData = await redis.get(`scores:${league}`);
  if (redisData) {
    memCache.set(league, redisData, 1000);
    return redisData;
  }

  // L3: Origin (external API)
  const data = await externalAPI.getScores(league);
  await redis.setex(`scores:${league}`, 10, JSON.stringify(data));
  memCache.set(league, data, 1000);

  return data;
}
```

### Pattern 4: Serverless Event-Driven Architecture

**What:** Use serverless functions triggered by scheduled events or data streams to process score updates

**When to use:** Unpredictable traffic patterns; need to minimize infrastructure costs; willing to accept cold start latency

**Trade-offs:**
- **Pros:** Auto-scaling; pay-per-use pricing; minimal infrastructure management
- **Cons:** Cold start latency (100-500ms); vendor lock-in; complex debugging

**Example:**
```typescript
// AWS Lambda function triggered every 5 seconds during game hours
export const handler = async (event: ScheduledEvent) => {
  const liveGames = await getLiveGames();

  for (const game of liveGames) {
    const updates = await fetchGameUpdates(game.id);

    // Push to AppSync for real-time delivery via WebSocket
    await appSync.mutate({
      mutation: UPDATE_GAME,
      variables: { gameId: game.id, data: updates }
    });

    // Store in DynamoDB
    await dynamoDB.put({
      TableName: 'GameUpdates',
      Item: { gameId: game.id, timestamp: Date.now(), ...updates }
    });
  }
};
```

### Pattern 5: Prediction Pipeline Separation

**What:** Separate ML prediction service from real-time score serving; run predictions asynchronously and cache results

**When to use:** When predictions are computationally expensive; when prediction latency is acceptable (seconds); when prediction logic changes independently from score serving

**Trade-offs:**
- **Pros:** Doesn't block score updates; allows Python ML ecosystem; independent scaling
- **Cons:** Predictions may lag real-time by seconds; adds service management complexity

**Example:**
```python
# ML service with feature pipeline
class PredictionPipeline:
    def __init__(self):
        self.model = load_model('game_predictor.pkl')

    async def predict_game(self, game_id: str):
        # Feature engineering
        features = await self.build_features(game_id)

        # Model inference (50-200ms)
        prediction = self.model.predict(features)

        # Cache prediction
        await redis.setex(
            f'prediction:{game_id}',
            300,  # 5-minute TTL
            json.dumps({
                'home_win_prob': float(prediction[0]),
                'away_win_prob': float(prediction[1]),
                'confidence': float(prediction[2])
            })
        )

    async def build_features(self, game_id: str):
        # Aggregate team stats, player stats, head-to-head
        team_stats = await get_team_stats(game_id)
        player_stats = await get_player_stats(game_id)
        h2h = await get_head_to_head(game_id)

        return {
            'team_offensive_rating': team_stats['home']['off_rating'],
            'team_defensive_rating': team_stats['home']['def_rating'],
            # ... more features
        }
```

## Data Flow

### Real-Time Score Update Flow

```
External Sports API
    ↓ (poll every 5-30s based on game state)
Data Aggregator Service
    ↓ (normalize, validate)
Redis Cache (10s TTL)
    ↓ (store)
    ├→ REST API Endpoint ──→ Client (HTTP request)
    └→ WebSocket Server ──→ Connected Clients (push)
         ↓
    Client State Updates
         ↓
    UI Re-render
```

### ML Prediction Flow

```
Game Schedule Created
    ↓
Trigger Prediction Job
    ↓
ML Service: Feature Pipeline
    ├→ Fetch Team Stats (Redis/DB)
    ├→ Fetch Player Stats (Redis/DB)
    ├→ Fetch Historical H2H (DB)
    └→ Build Feature Vector
         ↓
    Model Inference
         ↓
    Cache Prediction (Redis, 5-min TTL)
         ↓
    Available via API
```

### Initial Page Load Flow

```
User Request
    ↓
CDN Edge Location
    ├→ Static Assets (cached indefinitely)
    └→ API Response (cached 10-30s)
         ↓
    Client Hydration
         ↓
    WebSocket Connection Established
         ↓
    Subscribe to Live Updates
```

### Key Data Flows

1. **Score Polling:** Backend polls external APIs every 5-30 seconds based on game state (scheduled/live/final), caches in Redis, and pushes updates via WebSocket to connected clients
2. **Client Subscription:** Client establishes WebSocket connection on page load, subscribes to specific game updates, receives push notifications when scores change
3. **Prediction Generation:** Asynchronous job fetches team/player stats, runs feature engineering, performs model inference, caches result for 5 minutes
4. **Cache Hierarchy:** Three-tier caching (in-memory → Redis → origin) with different TTLs (1s → 10s → live API)
5. **CDN Distribution:** Static assets cached at edge locations; API responses with short TTL (5-30s) cached regionally to reduce backend load

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **0-10k users** | Monolithic Node.js backend with Redis; single server instance; CDN for static assets; simple polling from external API; acceptable to run everything on single VPS/EC2 instance |
| **10k-100k users** | Separate ML service from main backend; add load balancer; horizontal scaling of API servers; implement WebSocket connection pooling; use managed Redis (ElastiCache/Redis Cloud); CDN caching for API responses (5-30s TTL) |
| **100k-1M users** | Microservices architecture: split score aggregation, predictions, user preferences; event streaming (Kafka/Kinesis) for score updates; database read replicas; regional deployments for lower latency; serverless functions for prediction jobs; connection state externalization for WebSocket scaling |

### Scaling Priorities

1. **First bottleneck: External API Rate Limits**
   - **Symptom:** 429 errors from sports API; stale data during high-traffic games
   - **Solution:** Aggressive Redis caching (10-30s TTL); single polling service (not per-server); implement exponential backoff; use multiple API providers with fallback

2. **Second bottleneck: Database Query Load**
   - **Symptom:** Slow API responses; high database CPU; query timeouts
   - **Solution:** Add read replicas; cache frequently accessed queries in Redis; denormalize data for common query patterns; add database indexes on game_id, league, timestamp

3. **Third bottleneck: WebSocket Connection Limits**
   - **Symptom:** Connection drops; memory exhaustion; CPU spikes
   - **Solution:** Connection pooling; externalize connection state to Redis; use dedicated WebSocket service; consider managed WebSocket service (AWS AppSync, Pusher)

4. **Fourth bottleneck: ML Prediction Latency**
   - **Symptom:** Slow prediction API responses; timeout errors
   - **Solution:** Pre-compute predictions for scheduled games; cache predictions aggressively (5-15 min); use lighter models (LightGBM vs deep learning); batch predictions

## Anti-Patterns

### Anti-Pattern 1: Per-Client API Polling

**What people do:** Each connected client polls external sports API directly from frontend

**Why it's wrong:**
- Exhausts API rate limits instantly (100 requests/day used in minutes)
- Exposes API keys in client code
- No caching benefit; every user makes redundant requests
- CORS issues with third-party APIs

**Do this instead:** Backend polls once per interval, caches result, serves to all clients via WebSocket or cached API endpoint

### Anti-Pattern 2: Synchronous Prediction During Score Requests

**What people do:** Calculate ML predictions inline when user requests game details

**Why it's wrong:**
- Adds 500-2000ms latency to every game detail request
- Blocks score serving with expensive computations
- Can't scale prediction independently
- Timeouts during traffic spikes

**Do this instead:** Pre-compute predictions asynchronously when games are scheduled; cache predictions with 5-15 minute TTL; serve from cache during game; separate ML service from score API

### Anti-Pattern 3: Real-Time WebSocket for Everything

**What people do:** Push every data update via WebSocket immediately, including historical stats, team rosters, etc.

**Why it's wrong:**
- WebSocket overhead for data that rarely changes
- Wastes server resources maintaining connections
- Increased complexity for static data
- Mobile battery drain

**Do this instead:** Use WebSocket only for live scores and time-sensitive updates; serve historical data, team rosters, player stats via cached REST API; let clients poll non-live data at their pace

### Anti-Pattern 4: No Game State Awareness

**What people do:** Poll all games at same frequency regardless of game status

**Why it's wrong:**
- Wastes 70% of API calls on scheduled/finished games
- Hits rate limits unnecessarily
- Increases latency for live game updates due to request queue

**Do this instead:** Adaptive polling: 30s for scheduled games, 5-10s for live games, 5 minutes for final games; prioritize live games in polling queue; stop polling finished games after 1 hour

### Anti-Pattern 5: No TTL Differentiation

**What people do:** Cache all data with same TTL (e.g., 60 seconds for everything)

**Why it's wrong:**
- Serves stale live scores (user frustration)
- Wastes cache space on rarely-changing data
- Doesn't optimize for data volatility patterns

**Do this instead:**
- Live game scores: 5-10s TTL
- Scheduled games: 30-120s TTL
- Final scores: 5-15 min TTL
- Team rosters: 24 hour TTL
- Historical stats: 7 day TTL

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Free Sports APIs** (balldontlie.io, API-Basketball) | REST polling with rate limit awareness | Rate limits: 100-1000 req/day; implement exponential backoff; cache aggressively; use multiple providers with fallback |
| **CDN** (CloudFlare, CloudFront) | Origin pull with cache headers | Configure Cache-Control headers (5-30s for API, 1 year for static); use origin shield to reduce backend load |
| **Redis Cache** | Direct connection from backend | Use connection pooling; implement retry logic; set appropriate TTLs; monitor memory usage |
| **ML Model Serving** | Internal REST API or gRPC | Keep latency under 200ms; use model versioning; implement fallback to cached predictions if service unavailable |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Frontend ↔ Backend** | REST API + WebSocket | REST for initial data/historical; WebSocket for live updates; implement reconnection logic with exponential backoff |
| **Backend ↔ ML Service** | REST API (async) | Backend requests predictions, ML service returns cached result or 202 Accepted; client polls or receives via WebSocket when ready |
| **Backend ↔ External APIs** | REST with retry logic | Single polling service to avoid rate limit multiplication; implement circuit breaker pattern; use fallback data sources |
| **Backend ↔ Cache** | Redis protocol | Use pipelining for batch operations; implement cache-aside pattern; monitor hit rates (target: 85%+) |

## Build Order Recommendations

Based on component dependencies and value delivery:

### Phase 1: Core Score Display (MVP)
1. **Backend API Gateway** - Routes and basic endpoints
2. **External API Client** - Polling service for single league (NBA)
3. **Redis Caching Layer** - Basic caching with 10s TTL
4. **Frontend Score Display** - Simple list of live games
5. **Validation:** Users can see live scores for one league

### Phase 2: Real-Time Updates
1. **WebSocket Server** - Push updates to clients
2. **Adaptive Polling** - Game-state-aware polling intervals
3. **Frontend WebSocket Client** - Auto-reconnect, state updates
4. **Validation:** Scores update in real-time without page refresh

### Phase 3: Multi-League Support
1. **Data Aggregator Service** - Normalize data from multiple APIs
2. **Multi-API Client** - Support for NBA, NCAA, EuroLeague
3. **Frontend League Filtering** - UI for switching between leagues
4. **Validation:** Users can view scores across multiple leagues

### Phase 4: Game Details & Context
1. **Game Detail API** - Play-by-play, player stats, team stats
2. **Database Layer** - Store historical data for quick retrieval
3. **Frontend Game Detail View** - Detailed game page with context
4. **Validation:** Users can drill into individual games for details

### Phase 5: ML Predictions (Differentiator)
1. **Feature Engineering Pipeline** - Extract features from historical data
2. **ML Model Training** - Train initial model on historical games
3. **ML Service API** - Serve predictions with caching
4. **Frontend Prediction Display** - Show win probabilities and confidence
5. **Validation:** Users see AI predictions for upcoming/live games

### Dependency Notes:
- Phase 2 depends on Phase 1 (needs base API to push updates)
- Phase 4 depends on Phase 1-2 (needs real-time data foundation)
- Phase 5 is independent of Phases 2-4 (can be built in parallel after Phase 1)
- CDN layer can be added at any phase but shows most value after Phase 2

## Sources

### Architecture Patterns
- [Design patterns for sports apps and live event platforms](https://ably.com/blog/design-patterns-sports-live-events) - MEDIUM confidence (WebSearch verified)
- [Real-time live sports updates with AWS AppSync](https://aws.amazon.com/blogs/mobile/appsync-real-time-live-sports/) - HIGH confidence (official AWS documentation)
- [Backend for Frontend (BFF) Architecture](https://alokai.com/blog/backend-for-frontend) - MEDIUM confidence
- [Sports activities and serverless architecture](https://tsh.io/blog/sports-activities-and-serverless-the-architecture-for-data-driven-systems) - MEDIUM confidence

### Real-Time Data & Streaming
- [How to Architect a Scalable, Low-Latency Sports Data Pipeline](https://medium.com/@marketing_25315/how-to-architect-a-scalable-low-latency-sports-data-pipeline-for-real-time-apps-385b18246fd8) - MEDIUM confidence
- [Building a real-time Livescore app with Football API](https://www.sportmonks.com/blogs/building-a-real-time-livescore-app-with-a-football-api-best-practices/) - MEDIUM confidence
- [Sports API Development for Real-Time Scores](https://www.wildnetedge.com/blogs/sports-api-development-for-real-time-scores-syncing) - LOW confidence

### Caching Strategies
- [Winter Olympics 2026: Streaming & Web Performance](https://www.daillac.com/en/blogue/winter-olympics-2026-web-performance/) - MEDIUM confidence
- [Content delivery best practices - Google Cloud CDN](https://cloud.google.com/cdn/docs/best-practices) - HIGH confidence (official documentation)
- [Caching Layers Explained: Browser, CDN, and App Caching](https://technori.com/2026/03/24675-caching-layers-explained-browser-cdn-and-app-caching/marcus/) - MEDIUM confidence
- [How to Optimize PageSpeed for Sports Betting Sites](https://prerender.io/blog/how-to-optimize-pagespeed-for-igaming-sports-betting-sites/) - MEDIUM confidence

### API Best Practices
- [7 best practices for polling API endpoints](https://www.merge.dev/blog/api-polling-best-practices) - MEDIUM confidence
- [API Rate Limit - Sportmonks](https://www.sportmonks.com/glossary/api-rate-limit/) - MEDIUM confidence
- [API-Sports Documentation](https://api-sports.io/documentation/basketball/v1) - HIGH confidence (official documentation)
- [balldontlie.io - Free NBA API](https://www.balldontlie.io/) - HIGH confidence (official documentation)

### ML/AI Prediction Architecture
- [Stacked ensemble model for NBA game outcome prediction](https://www.nature.com/articles/s41598-025-13657-1) - HIGH confidence (peer-reviewed research)
- [Sports Prediction Platform: Real-Time Analytics Architecture](https://blockchain-development-solutions.com/case-studies/sports-prediction-platform) - LOW confidence
- [Integration of ML XGBoost for NBA game prediction](https://pmc.ncbi.nlm.nih.gov/articles/PMC11265715/) - HIGH confidence (peer-reviewed research)
- [How the NBA and AWS built an AI system](https://aws.amazon.com/blogs/media/how-the-nba-and-aws-built-an-ai-system-to-measure-what-actually-wins-basketball-games/) - HIGH confidence (official AWS case study)

### Backend Technologies
- [Sports Score Tracker with NodeJS and ExpressJS](https://www.geeksforgeeks.org/node-js/sports-score-tracker-with-nodejs-and-expressjs/) - MEDIUM confidence
- [Node.js vs Python: Best Backend Choice for 2025](https://kanhasoft.com/blog/node-js-vs-python-which-is-best-for-backend-development-in-2025/) - LOW confidence
- [Building leaderboard functionality with serverless data analytics](https://aws.amazon.com/blogs/compute/building-serverless-applications-with-streaming-data-part-4/) - HIGH confidence (official AWS documentation)

### State Management
- [How to Handle State in Real-Time Data-Driven Frontend Apps](https://blog.pixelfreestudio.com/how-to-handle-state-in-real-time-data-driven-frontend-apps/) - MEDIUM confidence

---
*Architecture research for: Basketball Live Scores Website*
*Researched: 2026-03-10*
