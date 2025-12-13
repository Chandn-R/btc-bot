# BTC Price Break Bot

Small, resilient Node.js service that listens to Binance WebSocket (trade stream) and notifies when BTC crosses rounded 1,000 levels.

## Features

-   Robust WebSocket reconnect and exponential backoff
-   Prevents duplicate notifications per level with in-memory and optional persistent store
-   Health + metrics endpoint (HTTP) for uptime checks
-   Docker-ready and example Fly deploy
-   Telegram notifications (extendable)

## Quick start (local)

1. Copy `.env.example` to `.env` and fill values.
2. `docker build -t btc-price-bot .`
3. `docker run --env-file .env btc-price-bot`

## Deploy

-   Use Fly, Railway, Render, or any Docker-capable host.
-   For Fly: `fly launch` then `fly deploy` (fly.toml included)

## Production notes

-   Use a small external datastore (Redis) if you need persistence across restarts.
-   Use a process supervisor (Fly, systemd, or Docker restart policy) to keep container running.
-   Monitor logs and metrics endpoint.

---

## File: `.env.example`

```text
# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Binance (public stream, no API key required)
BINANCE_WS=wss://stream.binance.com:9443/ws
PAIRS=btcusdt,ethusdt

# App
ROUND_STEP=1000
NOTIFY_COOLDOWN_SECONDS=300
PORT=3000
LOG_LEVEL=info

# Optional Redis (for persistence of last levels)
REDIS_URL=redis://localhost:6379
```
