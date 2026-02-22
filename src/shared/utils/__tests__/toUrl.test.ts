import toUrl from '../toUrl';

describe('toUrl', () => {
    test('converts single URL to markdown link', () => {
        const input = 'https://www.example.com';
        const expected = '[https://www.example.com](https://www.example.com)';
        
        expect(toUrl(input)).toBe(expected);
    });

    test('converts URL with path to markdown link', () => {
        const input = 'https://www.example.com/path/to/page';
        const expected = '[https://www.example.com/path/to/page](https://www.example.com/path/to/page)';
        
        expect(toUrl(input)).toBe(expected);
    });

    test('converts URL with query parameters to markdown link', () => {
        const input = 'https://example.com/search?q=test&page=1';
        const expected = '[https://example.com/search?q=test&page=1](https://example.com/search?q=test&page=1)';
        
        expect(toUrl(input)).toBe(expected);
    });

    test('converts URL with hash to markdown link', () => {
        const input = 'https://example.com/page#section';
        const expected = '[https://example.com/page#section](https://example.com/page#section)';
        
        expect(toUrl(input)).toBe(expected);
    });

    test('converts http URL (without s) to markdown link', () => {
        const input = 'http://example.com';
        const expected = '[http://example.com](http://example.com)';
        
        expect(toUrl(input)).toBe(expected);
    });

    test('preserves text before URL', () => {
        const input = 'Check out https://www.example.com for more info';
        const expected = 'Check out [https://www.example.com](https://www.example.com) for more info';
        
        expect(toUrl(input)).toBe(expected);
    });

    test('preserves text after URL', () => {
        const input = 'https://www.example.com - My Website';
        const expected = '[https://www.example.com](https://www.example.com) - My Website';
        
        expect(toUrl(input)).toBe(expected);
    });

    test('preserves text around URL', () => {
        const input = 'Visit https://www.example.com for details';
        const expected = 'Visit [https://www.example.com](https://www.example.com) for details';
        
        expect(toUrl(input)).toBe(expected);
    });

    test('converts multiple URLs in text', () => {
        const input = 'Visit https://www.example.com and https://www.another.com for more';
        const expected = 'Visit [https://www.example.com](https://www.example.com) and [https://www.another.com](https://www.another.com) for more';
        
        expect(toUrl(input)).toBe(expected);
    });

    test('converts multiple URLs on same line', () => {
        const input = 'https://site1.com https://site2.com https://site3.com';
        const expected = '[https://site1.com](https://site1.com) [https://site2.com](https://site2.com) [https://site3.com](https://site3.com)';
        
        expect(toUrl(input)).toBe(expected);
    });

    test('returns original text when no URLs present', () => {
        const input = 'This is just plain text without any links';
        
        expect(toUrl(input)).toBe(input);
    });

    test('returns empty string for undefined input', () => {
        expect(toUrl(undefined)).toBe('');
    });

    test('returns empty string for empty string input', () => {
        expect(toUrl('')).toBe('');
    });

    test('handles URL at start of text', () => {
        const input = 'https://example.com is a great website';
        const expected = '[https://example.com](https://example.com) is a great website';
        
        expect(toUrl(input)).toBe(expected);
    });

    test('handles URL at end of text', () => {
        const input = 'Check out my site: https://example.com';
        const expected = 'Check out my site: [https://example.com](https://example.com)';
        
        expect(toUrl(input)).toBe(expected);
    });

    test('handles URLs with port numbers', () => {
        const input = 'https://example.com:8080/api/endpoint';
        const expected = '[https://example.com:8080/api/endpoint](https://example.com:8080/api/endpoint)';
        
        expect(toUrl(input)).toBe(expected);
    });

    test('handles URLs with special characters in path', () => {
        const input = 'https://example.com/path_with-special~chars+test';
        const expected = '[https://example.com/path_with-special~chars+test](https://example.com/path_with-special~chars+test)';
        
        expect(toUrl(input)).toBe(expected);
    });

    test('handles URLs with @ symbol', () => {
        const input = 'https://user@example.com/path';
        const expected = '[https://user@example.com/path](https://user@example.com/path)';
        
        expect(toUrl(input)).toBe(expected);
    });

    test('handles mixed http and https URLs', () => {
        const input = 'http://example.com and https://secure.com';
        const expected = '[http://example.com](http://example.com) and [https://secure.com](https://secure.com)';
        
        expect(toUrl(input)).toBe(expected);
    });

    test('does not convert incomplete URLs', () => {
        const input = 'This is not a URL: www.example.com';
        
        expect(toUrl(input)).toBe(input);
    });

    test('does not convert URLs without protocol', () => {
        const input = 'example.com is not converted';
        
        expect(toUrl(input)).toBe(input);
    });
});
