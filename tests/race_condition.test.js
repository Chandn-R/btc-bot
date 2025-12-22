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
        send: jest.fn(async () => {
            // Simulate network delay to exaggerate race condition
            await new Promise(resolve => setTimeout(resolve, 50));
        })
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
const { isDailyStart } = await import('../src/logic/strategy.js');
const { getNearestLevels } = await import('../src/utils/common.js');

describe('Race Condition Check', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        app.lastPrices = {};
        app.lastDailyCheckDay = 0;
    });

    test('should NOT send multiple notifications for concurrent calls', async () => {
        isDailyStart.mockReturnValue(true);
        getNearestLevels.mockReturnValue({ up: 51000, down: 50000 });

        // Simulate 10 concurrent price updates arriving at the same time
        const updates = Array(10).fill(null).map(() => app.checkDailyNotification('BTCUSD', 50500));
        await Promise.all(updates);

        expect(alertService.send).toHaveBeenCalledTimes(1);
    });
});
