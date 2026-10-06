import ensureMode from "./ensureMode";

describe('ensureMode', () => {
  it.each(['light', 'dark'])('keeps the valid mode %s', (mode) => {
    expect(ensureMode(mode)).toBe(mode);
  });

  it.each([undefined, '', 'blue', 'LIGHT'])('drops the invalid mode %p', (mode) => {
    expect(ensureMode(mode)).toBeUndefined();
  });
});
