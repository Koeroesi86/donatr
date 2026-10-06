import createEtag from "./createEtag";

describe('createEtag', () => {
  it('returns the fixed etag for an empty body', () => {
    expect(createEtag('', 0)).toBe('"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"');
  });

  it('is stable for the same body', () => {
    expect(createEtag('hello', 5)).toBe(createEtag('hello', 5));
  });

  it('changes when the body changes', () => {
    expect(createEtag('hello', 5)).not.toBe(createEtag('hellp', 5));
  });

  it('prefixes the hex byte length and uses a 27 character hash', () => {
    const [length, hash] = createEtag('x'.repeat(255), 255).replace(/"/g, '').split('-');

    expect(length).toBe('ff');
    expect(hash).toHaveLength(27);
  });
});
