import getCountryCode from "./getCountryCode";

describe('getCountryCode', () => {
  it('takes the last part of a locale in lower case', () => {
    expect(getCountryCode('en-US')).toBe('us');
    expect(getCountryCode('hu-HU')).toBe('hu');
  });

  it('falls back to the whole value when there is no region', () => {
    expect(getCountryCode('HU')).toBe('hu');
  });
});
