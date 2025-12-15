import { getNearestLevels } from '../../src/utils/common.js';

describe('Common Utils', () => {
    describe('getNearestLevels', () => {
        test('should calculate correct up and down levels', () => {
            const { up, down } = getNearestLevels(50500);
            expect(up).toBe(51000);
            expect(down).toBe(50000);
        });

        test('should handle exact multiples', () => {
            const { up, down } = getNearestLevels(50000);
            expect(up).toBe(50000);
            expect(down).toBe(50000);
        });

        test('should work with custom step', () => {
            const { up, down } = getNearestLevels(50500, 500);
            expect(up).toBe(50500);
            expect(down).toBe(50500);

            const { up: up2, down: down2 } = getNearestLevels(50501, 500);
            expect(up2).toBe(51000);
            expect(down2).toBe(50500);
        });
    });
});
