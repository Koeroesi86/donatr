import {getCookie, setCookie} from "./cookies";

const clearCookies = () => document.cookie.split(';').forEach((cookie) => {
  document.cookie = `${cookie.split('=')[0].trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
});

describe('cookies', () => {
  beforeEach(clearCookies);

  it('stores and reads a cookie', () => {
    setCookie('language', 'hu-HU', 1);

    expect(getCookie('language')).toBe('hu-HU');
  });

  it('finds the right cookie among several', () => {
    setCookie('mode', 'dark', 1);
    setCookie('language', 'en-US', 1);

    expect(getCookie('mode')).toBe('dark');
    expect(getCookie('language')).toBe('en-US');
  });

  it('returns undefined for a missing cookie', () => {
    expect(getCookie('missing')).toBeUndefined();
  });

  it('does not match cookies whose name only ends the same', () => {
    setCookie('xmode', 'dark', 1);

    expect(getCookie('mode')).toBeUndefined();
  });

  it('sets an expiry in the future when days are given', () => {
    const cookieSetter = jest.spyOn(document, 'cookie', 'set');
    setCookie('mode', 'light', 2);

    const [cookie] = cookieSetter.mock.calls[0];
    const expires = new Date(cookie.match(/expires=([^;]+)/)?.[1] ?? '').getTime();

    expect(expires - Date.now()).toBeGreaterThan(47 * 60 * 60 * 1000);
    expect(cookie).toContain('path=/');
    cookieSetter.mockRestore();
  });
});
