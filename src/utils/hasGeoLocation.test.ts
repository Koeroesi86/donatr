import hasGeoLocation from "./hasGeoLocation";

describe('hasGeoLocation', () => {
  const withGeo = { id: '1', organisationId: 'o', name: 'n', location: { lat: 1, lng: 2, text: 't' } };
  const withoutGeo = { id: '2', organisationId: 'o', name: 'n' };

  it('detects locations that have coordinates', () => {
    expect(hasGeoLocation(withGeo)).toBe(true);
    expect(hasGeoLocation(withoutGeo)).toBe(false);
  });

  it('can be used to narrow a list of locations', () => {
    expect([withGeo, withoutGeo].filter(hasGeoLocation)).toEqual([withGeo]);
  });
});
