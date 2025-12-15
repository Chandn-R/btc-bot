import { checkBreakout, isDailyStart } from '../../src/logic/strategy.js';

describe('Strategy Logic', () => {
    describe('checkBreakout', () => {
        const step = 1000; // Default step from config logic assumption

        test('should return null if no last price', () => {
            expect(checkBreakout(null, 50000)).toBeNull();
        });

        test('should return null if price movement is within the same level step', () => {
            // 50100 -> 50900 (Both in 50000-51000 range, no 1000 boundary crossed)
            // Wait, logic is: floor(lower/step)*step + step <= upper
            // lower=50100, step=1000 -> 51000. upper=50900. 51000 <= 50900 is False.
            expect(checkBreakout(50100, 50900)).toBeNull();
        });

        test('should detect breakout above', () => {
            // 50900 -> 51100. Lower=50900. Cross level = 51000. Upper=51100.
            // 51000 <= 51100 is True.
            const result = checkBreakout(50900, 51100);
            expect(result).toEqual({
                level: 51000,
                type: 'broke above',
                emoji: '🚀'
            });
        });

        test('should detect fall below', () => {
            // 51100 -> 50900. Lower=50900. Cross level = 51000. Upper=51100.
            const result = checkBreakout(51100, 50900);
            expect(result).toEqual({
                level: 51000,
                type: 'fell below',
                emoji: '⚠️'
            });
        });

        test('should handle exact boundary crossing', () => {
            // 50000 -> 51000. Lower=50000. Cross level = 51000. Upper=51000.
            // 51000 <= 51000 is True.
            const result = checkBreakout(50000, 51000);
            expect(result).toEqual({
                level: 51000,
                type: 'broke above',
                emoji: '🚀'
            });
        });
    });

    describe('isDailyStart', () => {
        test('should return true for 00:00 UTC', () => {
            const date = new Date('2023-01-01T00:00:00Z');
            expect(isDailyStart(date)).toBe(true);
        });

        test('should return false for other times', () => {
            expect(isDailyStart(new Date('2023-01-01T00:01:00Z'))).toBe(false);
            expect(isDailyStart(new Date('2023-01-01T01:00:00Z'))).toBe(false);
            expect(isDailyStart(new Date('2023-01-01T05:30:00+05:30'))).toBe(true); // 5:30 IST is 00:00 UTC
        });
    });
});
