import { config as loadEnv } from 'dotenv';
import assert from 'assert';

loadEnv();

const cfg = {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
    BINANCE_WS: process.env.BINANCE_WS || 'wss://stream.binance.com:9443/ws',
    PAIRS: (process.env.PAIRS || 'btcusdt').split(',').map((p) => p.trim().toLowerCase()),
    ROUND_STEP: parseInt(process.env.ROUND_STEP || '1000', 10),
    NOTIFY_COOLDOWN_SECONDS: parseInt(process.env.NOTIFY_COOLDOWN_SECONDS || '300', 10),
    REDIS_URL: process.env.REDIS_URL || null,
    PORT: parseInt(process.env.PORT || '3000', 10),
    LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};

assert(cfg.TELEGRAM_BOT_TOKEN, 'TELEGRAM_BOT_TOKEN required');
assert(cfg.TELEGRAM_CHAT_ID, 'TELEGRAM_CHAT_ID required');

export default cfg;
