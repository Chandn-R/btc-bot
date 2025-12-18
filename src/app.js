import cfg from './config/index.js';
import logger from './services/log.service.js';
import priceService from './services/price.service.js';
import redisService from './services/redis.service.js';
import alertService from './services/alert.service.js';
import { checkBreakout, isDailyStart } from './logic/strategy.js';
import { getNearestLevels, nowSec } from './utils/common.js';
import { createHealthServer } from './services/health.service.js';

class App {
    constructor() {
        this.lastPrices = {};
        this.lastDailyCheckDay = 0;
    }

    async start() {
        logger.info('Starting BTC-Bot...');

        // Start Health Check Server
        createHealthServer(() => ({
            uptime: process.uptime(),
            redis: redisService.health(),
            price: priceService.health()
        }));

        // Subscribe to Price Updates
        priceService.on('price', (data) => this.handlePrice(data));
        priceService.connect();
    }

    async handlePrice({ pair, price }) {
        const last = this.lastPrices[pair] || price;

        // 1. Daily Check (5:30 IST / 00:00 UTC)
        this.checkDailyNotification(pair, price);

        // 2. Breakout Check
        await this.checkBreakout(pair, last, price);

        // Update memory
        this.lastPrices[pair] = price;
    }

    async checkDailyNotification(pair, price) {
        const now = new Date();
        if (isDailyStart(now)) {
            const currentDay = now.getUTCDate();
            if (this.lastDailyCheckDay !== currentDay) {
                const { up, down } = getNearestLevels(price, cfg.ROUND_STEP);
                await alertService.send(
                    `☀️ Start of Trading Day (5:30 IST).\n${pair.toUpperCase()} Price: ${price}\nWatching levels: broke > ${up} or fell < ${down}`
                );
                this.lastDailyCheckDay = currentDay;
            }
        }
    }

    async checkBreakout(pair, last, price) {
        const result = checkBreakout(last, price);
        if (result) {
            const { level, type, emoji } = result;

            logger.info(
                `[BREAKOUT] ${pair.toUpperCase()} ${type} ${level} | Price: ${last} -> ${price}`
            );

            // Check cooldown / duplicate (1H candle rule)
            const lastNot = await redisService.getLastNotified(pair);
            const currentCandleStart = Math.floor(nowSec() / 3600) * 3600;

            const isDuplicate =
                lastNot &&
                lastNot.level === level &&
                lastNot.ts >= currentCandleStart;

            if (!isDuplicate) {
                // Mark notified immediately to prevent race conditions
                await redisService.markNotified(pair, level);

                await alertService.send(
                    `${emoji} ${pair.toUpperCase()} ${type} ${level} — ${price}`
                );
            } else {
                logger.info(`Skipped duplicate for ${pair}@${level}`);
            }
        }
    }
}

export default new App();
