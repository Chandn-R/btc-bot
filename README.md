# BTC Price Break Bot

A resilient, production-ready Node.js service that monitors real-time Bitcoin prices via Binance WebSocket and sends instant Telegram notifications when price levels are broken.

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Status: Active](https://img.shields.io/badge/Status-Active-success.svg)

## 🚀 Features

-   **Smart Breakout Detection**: Uses range-based logic to detect price crossings even during massive volatility (e.g., jumping from 97,990 to 98,010 instantly).
-   **Daily Market Alerts**: Sends a "Start of Trading Day" summary at 00:00 UTC (5:30 IST) with current price and nearest levels.
-   **Resource Optimized**: Uses Binance `@aggTrade` stream to handle high-frequency data with minimal CPU (<1%).
-   **Health Monitoring**:
    -   Real-time health checks for Redis and WebSocket connections.
    -   Docker native `HEALTHCHECK` integration with auto-healing.
-   **Production Ready**:
    -   Structured logging (Console + File rotation).
    -   Graceful shutdown and reconnection logic.
    -   Redis persistence to prevent duplicate alerts on restart.

---

## 🛠️ Quick Start (Docker)

This is the recommended way to run the bot.

1.  **Clone the repository**:
    ```bash
    git clone <repo-url>
    cd BTC-bot
    ```

2.  **Configure Environment**:
    Copy the example config and edit it.
    ```bash
    cp .env.example .env
    ```

3.  **Start Services**:
    ```bash
    docker-compose up -d --build
    ```
    This starts both the **Bot** and a **Redis** instance.

4.  **Verify Status**:
    ```bash
    # Check logs
    docker-compose logs -f

    # Check Health (Status should be 'healthy')
    docker ps
    ```

---
 
 ## 🚀 Deployment Automation (AWS EC2)
 
 This repository includes automation scripts optimized for **Amazon Linux 2023** on modest hardware (like `t2.micro`).
 
 ### 1. One-Time Setup
 Run this script immediately after launching your EC2 instance. It installs Git, Docker, and configures Swap memory (crucial for t2.micro).
 
 ```bash
 # 1. Clone repo
 git clone <repo-url>
 cd BTC-bot
 
 # 2. Run Setup
 ./scripts/setup.sh
 ```
 *Note: You will be asked to log out and log back in to apply Docker permissions.*
 
 ### 2. Updates
 To pull the latest code and redeploy safely:
 
 ```bash
 ./scripts/update.sh
 ```
 
 ---

## ⚙️ Configuration

The application is configured via environment variables.

| Variable | Default | Description |
| :--- | :--- | :--- |
| `TELEGRAM_BOT_TOKEN` | **Required** | Your Telegram Bot Token from @BotFather. |
| `TELEGRAM_CHAT_ID` | **Required** | Chat ID or Channel ID to send alerts to. |
| `BINANCE_WS` | `wss://stream.binance.com:9443/ws` | Binance WebSocket Base URL. |
| `PAIRS` | `btcusdt` | Comma-separated list of pairs to watch (e.g., `btcusdt,ethusdt`). |
| `ROUND_STEP` | `1000` | The price levels to watch (e.g., every 1000, 500, etc.). |
| `NOTIFY_COOLDOWN_SECONDS` | `300` | Cooldown preventing duplicate alerts for the *same* level. |
| `REDIS_URL` | `null` | Connection string for Redis (e.g., `redis://localhost:6379`). |
| `PORT` | `3000` | Port for the Health Check HTTP server. |
| `LOG_LEVEL` | `info` | Logging detail (`debug`, `info`, `warn`, `error`). |

---

## 📊 Monitoring & Logs

### Application Logs
Logs are saved to the `logs/` directory on your host machine:
-   `logs/combined.log`: All application events (Startup, Breakouts, Connection).
-   `logs/error.log`: only Error-level events.

View real-time logs via Docker:
```bash
docker-compose logs -f
```

### Health Check Endpoint
The bot exposes a rich health status endpoint on port `3000`.
```bash
curl http://localhost:3000/healthz
```
**Response:**
```json
{
  "uptime": 25.1,
  "redis": { "status": "connected", "redisStatus": "ready" },
  "price": { "status": "connected", "readyState": 1, "lastMessageAgoMs": 211 }
}
```

---

## 📂 Architecture

The project follows a modular service-based architecture:

-   `src/app.js`: Main orchestrator. Wires specific services together.
-   `src/services/`:
    -   `price.service.js`: Manages WebSocket connection (`@aggTrade`), reconnections, and event emission.
    -   `redis.service.js`: Handles state persistence.
    -   `alert.service.js`: Manages Telegram API interactions.
    -   `health.service.js`: Express server for `/healthz`.
    -   `log.service.js`: Winston configuration for File/Console logging.
-   `src/logic/`:
    -   `strategy.js`: Pure business logic (Breakout calculation, Daily check validation).

---

## 📝 License

This project is licensed under the MIT License.
