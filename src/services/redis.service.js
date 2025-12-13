import IORedis from 'ioredis';
import cfg from '../config/index.js';
import { nowSec } from '../utils/common.js';

class RedisService {
    constructor() {
        this.redis = cfg.REDIS_URL ? new IORedis(cfg.REDIS_URL) : null;
        this.memoryCache = {}; // In-memory fallback
    }

    _getKey(pair) {
        return `bot:lastLevel:${pair}`;
    }

    async markNotified(pair, level) {
        const data = { level, ts: nowSec() };
        this.memoryCache[pair] = data;
        if (this.redis) {
            await this.redis.set(this._getKey(pair), JSON.stringify(data), 'EX', 60 * 60 * 24);
        }
    }

    async getLastNotified(pair) {
        if (this.memoryCache[pair]) return this.memoryCache[pair];
        if (this.redis) {
            const v = await this.redis.get(this._getKey(pair));
            if (v) return JSON.parse(v);
        }
        return null;
    }

    health() {
        return {
            status: this.redis && this.redis.status === 'ready' ? 'connected' : 'disconnected',
            redisStatus: this.redis ? this.redis.status : 'disabled'
        };
    }
}

export default new RedisService();
