import { createDateTimeFormatter } from '../dateTimeFormat';

describe('createDateTimeFormatter', () => {
    const formatter = createDateTimeFormatter({ locale: 'en-US', timeZone: 'UTC' });

    test('uses the injected timezone for instants near a calendar boundary', () => {
        expect(formatter.formatDate('2026-09-01T00:00:00Z')).toBe('Sep 1, 2026');
        expect(formatter.formatDateTime('2026-08-01T18:30:00Z')).toBe('Aug 1, 2026, 6:30 PM');
    });

    test('provides the shared display shapes', () => {
        const value = '2026-08-01T18:30:45Z';
        expect(formatter.formatCompactDateTime(value)).toBe('Aug 1, 6 PM');
        expect(formatter.formatDateTimeWithSeconds(value)).toBe('Aug 1, 2026, 6:30:45 PM');
        expect(formatter.formatLongDate(value)).toBe('August 1, 2026');
        expect(formatter.formatTime(value)).toBe('6:30 PM');
    });
});
