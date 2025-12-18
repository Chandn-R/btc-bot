import { jest } from '@jest/globals';

// Mock config
jest.unstable_mockModule('../src/config/index.js', () => ({
    default: {
        ROUND_STEP: 1000,
        NOTIFY_COOLDOWN_SECONDS: 60
    }
}));

// Mock dependencies
jest.unstable_mockModule('../src/services/alert.service.js', () => ({
    default: {
        send: jest.fn()
    }
}));

jest.unstable_mockModule('../src/services/redis.service.js', () => ({
    default: {
        getLastNotified: jest.fn(),
        markNotified: jest.fn(),
        health: jest.fn()
    }
}));

jest.unstable_mockModule('../src/services/price.service.js', () => ({
    default: {
        on: jest.fn(),
        connect: jest.fn(),
        health: jest.fn()
    }
}));

jest.unstable_mockModule('../src/services/log.service.js', () => ({
    default: {
        info: jest.fn(),
        error: jest.fn()
    }
}));

jest.unstable_mockModule('../src/logic/strategy.js', () => ({
    checkBreakout: jest.fn(),
    isDailyStart: jest.fn()
}));

jest.unstable_mockModule('../src/utils/common.js', () => ({
    getNearestLevels: jest.fn(),
    nowSec: jest.fn()
}));

jest.unstable_mockModule('../src/services/health.service.js', () => ({
    createHealthServer: jest.fn()
}));

// Dynamic imports
const { default: app } = await import('../src/app.js');
const { default: alertService } = await import('../src/services/alert.service.js');
const { default: redisService } = await import('../src/services/redis.service.js');
const { checkBreakout, isDailyStart } = await import('../src/logic/strategy.js');
const { getNearestLevels, nowSec } = await import('../src/utils/common.js');

describe('App Orchestration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        app.lastPrices = {};
        app.lastDailyCheckDay = 0;
    });

    describe('checkDailyNotification', () => {
        test('should send daily notification if isDailyStart is true and not checked yet', async () => {
            isDailyStart.mockReturnValue(true);
            getNearestLevels.mockReturnValue({ up: 51000, down: 50000 });

            await app.checkDailyNotification('BTCUSD', 50500);

            expect(alertService.send).toHaveBeenCalledWith(
                expect.stringContaining('Start of Trading Day')
            );
        });

        test('should NOT send daily notification if isDailyStart is false', async () => {
            isDailyStart.mockReturnValue(false);
            await app.checkDailyNotification('BTCUSD', 50500);
            expect(alertService.send).not.toHaveBeenCalled();
        });
    });

    describe('checkBreakout', () => {
        test('should send alert if breakout detected and not duplicate', async () => {
            checkBreakout.mockReturnValue({ level: 51000, type: 'broke above', emoji: '🚀' });
            redisService.getLastNotified.mockResolvedValue(null);

            await app.checkBreakout('BTCUSD', 50900, 51100);

            expect(redisService.getLastNotified).toHaveBeenCalledWith('BTCUSD');
            expect(alertService.send).toHaveBeenCalledWith('🚀 BTCUSD broke above 51000 — 51100');
            expect(redisService.markNotified).toHaveBeenCalledWith('BTCUSD', 51000);
        });

        test('should skip alert if duplicate within same 1h candle', async () => {
            checkBreakout.mockReturnValue({ level: 51000, type: 'broke above', emoji: '🚀' });
            redisService.getLastNotified.mockResolvedValue({
                level: 51000,
                ts: 3610 // 01:00:10
            });
            nowSec.mockReturnValue(3700); // 01:01:40 (Same hour: 3600-7199)

            await app.checkBreakout('BTCUSD', 50900, 51100);

            expect(alertService.send).not.toHaveBeenCalled();
            expect(redisService.markNotified).not.toHaveBeenCalled();
        });

        test('should send alert if duplicate but in new 1h candle', async () => {
            checkBreakout.mockReturnValue({ level: 51000, type: 'broke above', emoji: '🚀' });
            redisService.getLastNotified.mockResolvedValue({
                level: 51000,
                ts: 3500 // 00:58:20 (Previous hour)
            });
            nowSec.mockReturnValue(3700); // 01:01:40 (New hour)

            await app.checkBreakout('BTCUSD', 50900, 51100);

            expect(alertService.send).toHaveBeenCalled();
            expect(redisService.markNotified).toHaveBeenCalledWith('BTCUSD', 51000);
        });
    });
});
