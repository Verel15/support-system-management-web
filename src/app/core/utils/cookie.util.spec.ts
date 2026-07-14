import { getCookie, removeCookie, setCookie } from './cookie.util';

describe('cookie.util', () => {
  beforeEach(() => {
    // Clear all cookies before each test
    for (const row of document.cookie.split('; ')) {
      const name = row.split('=')[0];
      if (name) removeCookie(name);
    }
  });

  describe('setCookie / getCookie', () => {
    it('stores and reads back a value', () => {
      setCookie('token', 'abc123');
      expect(getCookie('token')).toBe('abc123');
    });

    it('URL-encodes and decodes special characters', () => {
      setCookie('data', 'a=b; c&d');
      expect(getCookie('data')).toBe('a=b; c&d');
    });

    it('returns null for a missing cookie', () => {
      expect(getCookie('does-not-exist')).toBeNull();
    });

    it('reads the correct cookie when multiple exist', () => {
      setCookie('first', 'one');
      setCookie('second', 'two');
      expect(getCookie('first')).toBe('one');
      expect(getCookie('second')).toBe('two');
    });
  });

  describe('removeCookie', () => {
    it('removes a previously set cookie', () => {
      setCookie('temp', 'value');
      expect(getCookie('temp')).toBe('value');
      removeCookie('temp');
      expect(getCookie('temp')).toBeNull();
    });
  });
});
