import cfg from '../config/index.js';

/**
 * Checks if a price movement crossed a major level (1000 step).
 * @param {number} lastPrice
 * @param {number} currentPrice
 * @returns {object|null} { level: number, type: 'broke above' | 'fell below' } or null
 */
export function checkBreakout(lastPrice, currentPrice) {
    if (!lastPrice) return null;

    const lower = Math.min(lastPrice, currentPrice);
    const upper = Math.max(lastPrice, currentPrice);

    // Find the first multiple of ROUND_STEP strictl > lower
    // e.g. lower=96990, step=1000 -> 97000
    const step = cfg.ROUND_STEP;
    const crossedLevel = Math.floor(lower / step) * step + step;

    if (crossedLevel <= upper) {
        const isUp = currentPrice > lastPrice;
        return {
            level: crossedLevel,
            type: isUp ? 'cross above' : 'cross below',
            emoji: isUp ? '🟢' : '🔴'
        };
    }

    return null;
}

/**
 * Checks if it is time for the daily greeting
 * @param {Date} dateObj
 * @returns {boolean}
 */
export function isDailyStart(dateObj) {
    return dateObj.getUTCHours() === 0 && dateObj.getUTCMinutes() === 0;
}
