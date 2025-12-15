import { jest } from '@jest/globals';

// Mock config BEFORE importing the service
jest.unstable_mockModule('../../src/config/index.js', () => ({
    default: {
        TELEGRAM_BOT_TOKEN: 'fake_token',
        TELEGRAM_CHAT_ID: 'fake_chat_id'
    }
}));

// Mock axios
jest.unstable_mockModule('axios', () => ({
    default: {
        get: jest.fn()
    }
}));

// Mock logger
jest.unstable_mockModule('../../src/services/log.service.js', () => ({
    default: {
        info: jest.fn(),
        error: jest.fn()
    }
}));

// Dynamic imports
const { default: alertService } = await import('../../src/services/alert.service.js');
const { default: axios } = await import('axios');
const { default: logger } = await import('../../src/services/log.service.js');

describe('AlertService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should send telegram message successfully', async () => {
        axios.get.mockResolvedValue({ data: { ok: true } });

        await alertService.send('Hello BTC');

        expect(axios.get).toHaveBeenCalledWith(
            'https://api.telegram.org/botfake_token/sendMessage',
            { params: { chat_id: 'fake_chat_id', text: 'Hello BTC' } }
        );
        expect(logger.info).toHaveBeenCalledWith('Sent notification: Hello BTC');
    });

    test('should handle errors gracefully', async () => {
        axios.get.mockRejectedValue(new Error('Network error'));

        await alertService.send('Fail msg');

        expect(axios.get).toHaveBeenCalled();
        expect(logger.error).toHaveBeenCalledWith('Failed to send notification: Network error');
    });
});

