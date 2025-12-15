import { jest } from '@jest/globals';

// Only mock logger to keep console clean
jest.unstable_mockModule('../../src/services/log.service.js', () => ({
    default: {
        info: jest.fn(),
        error: jest.fn()
    }
}));

// Dynamic imports
const { default: alertService } = await import('../../src/services/alert.service.js');
const { default: logger } = await import('../../src/services/log.service.js');

describe('AlertService', () => {
    // Increase timeout for real network request
    jest.setTimeout(10000);

    test('should send a REAL telegram message successfully', async () => {
        // This relies on .env being present and valid
        const message = `TEST NOTIFICATION from Jest at ${new Date().toISOString()}`;

        console.log('Attempting to send real Telegram message...');
        await alertService.send(message);

        expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Sent notification'));
        console.log('Message sent! Check your Telegram.');
    });
});


