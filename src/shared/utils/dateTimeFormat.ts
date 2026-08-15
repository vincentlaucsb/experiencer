export type DateTimeValue = Date | number | string;

export interface DateTimeFormatterOptions {
    locale?: Intl.LocalesArgument;
    timeZone?: string;
}

export interface DateTimeFormatter {
    formatCompactDateTime: (value: DateTimeValue) => string;
    formatDate: (value: DateTimeValue) => string;
    formatDateTime: (value: DateTimeValue) => string;
    formatDateTimeWithSeconds: (value: DateTimeValue) => string;
    formatLongDate: (value: DateTimeValue) => string;
    formatTime: (value: DateTimeValue) => string;
}

function date(value: DateTimeValue): Date {
    return value instanceof Date ? value : new Date(value);
}

/** Creates the shared date formatter while keeping locale and timezone policy injectable. */
export function createDateTimeFormatter(
    options: DateTimeFormatterOptions = {}
): DateTimeFormatter {
    const timeZone = options.timeZone ? { timeZone: options.timeZone } : {};
    const compactDateTime = new Intl.DateTimeFormat(options.locale, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        ...timeZone
    });
    const mediumDate = new Intl.DateTimeFormat(options.locale, {
        dateStyle: 'medium',
        ...timeZone
    });
    const mediumDateTime = new Intl.DateTimeFormat(options.locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
        ...timeZone
    });
    const mediumDateTimeWithSeconds = new Intl.DateTimeFormat(options.locale, {
        dateStyle: 'medium',
        timeStyle: 'medium',
        ...timeZone
    });
    const longDate = new Intl.DateTimeFormat(options.locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...timeZone
    });
    const shortTime = new Intl.DateTimeFormat(options.locale, {
        timeStyle: 'short',
        ...timeZone
    });

    return {
        formatCompactDateTime: value => compactDateTime.format(date(value)),
        formatDate: value => mediumDate.format(date(value)),
        formatDateTime: value => mediumDateTime.format(date(value)),
        formatDateTimeWithSeconds: value => mediumDateTimeWithSeconds.format(date(value)),
        formatLongDate: value => longDate.format(date(value)),
        formatTime: value => shortTime.format(date(value))
    };
}

export const browserDateTimeFormatter = createDateTimeFormatter();
