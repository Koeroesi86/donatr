/**
 * @jest-environment node
 */
import JsonProvider from "./json";
import * as translations from "./translations";
import {createTempDir, removeDir} from "../test/createTempDir";

describe('JsonProvider', () => {
  let dir: string;
  let provider: JsonProvider;

  const seed = async () => {
    await provider.setOrganisation({ id: 'org-1', name: 'Red Cross' });
    await provider.setOrganisation({ id: 'org-2', name: 'Food Bank' });
    await provider.setLocation({ id: 'loc-1', organisationId: 'org-1', name: 'North' });
    await provider.setLocation({ id: 'loc-2', organisationId: 'org-1', name: 'South' });
    await provider.setLocation({ id: 'loc-3', organisationId: 'org-2', name: 'East' });
    await provider.setNeed({ id: 'need-1', locationId: 'loc-1', name: 'Fresh bread' });
    await provider.setNeed({ id: 'need-2', locationId: 'loc-2', name: 'Blankets' });
    await provider.setNeed({ id: 'need-3', locationId: 'loc-3', name: 'Bread flour' });
  };

  beforeEach(() => {
    dir = createTempDir();
    provider = new JsonProvider({ basePath: dir });
  });

  afterEach(() => removeDir(dir));

  describe('locations', () => {
    beforeEach(seed);

    it('lists all locations without a filter', async () => {
      expect((await provider.getLocations()).result).toHaveLength(3);
    });

    it('filters locations by organisation', async () => {
      const { result } = await provider.getLocations({ organisationId: 'org-1' });

      expect(result.map((l) => l.id).sort()).toEqual(['loc-1', 'loc-2']);
    });

    it('returns no data for an unknown location', async () => {
      expect((await provider.getLocation('nope')).result).toBeUndefined();
    });
  });

  describe('needs', () => {
    beforeEach(seed);

    it('keeps the original name next to the name', async () => {
      const { result } = await provider.getNeeds({ locationId: 'loc-2' });

      expect(result).toEqual([{ id: 'need-2', locationId: 'loc-2', name: 'Blankets', originalName: 'Blankets' }]);
    });

    it('filters needs by search term and by location', async () => {
      expect((await provider.getNeeds({ search: 'flour' })).result.map((n) => n.id)).toEqual(['need-3']);
      expect((await provider.getNeeds({ search: 'Blank' })).result.map((n) => n.id)).toEqual(['need-2']);
      expect((await provider.getNeeds({ search: 'flour', locationId: 'loc-1' })).result).toEqual([]);
      expect((await provider.getNeeds({ locationId: 'loc-1' })).result.map((n) => n.id)).toEqual(['need-1']);
    });

    it('gets a single need with its original name', async () => {
      expect((await provider.getNeed('need-1')).result).toEqual({
        id: 'need-1', locationId: 'loc-1', name: 'Fresh bread', originalName: 'Fresh bread',
      });
      expect((await provider.getNeed('nope')).result).toBeUndefined();
    });

    it('keeps names untranslated when the requested language is not translatable', async () => {
      const { result } = await provider.getNeeds({}, 'xx');

      expect(result.find((n) => n.id === 'need-1')).toMatchObject({ name: 'Fresh bread', originalName: 'Fresh bread' });
    });
  });

  describe('removing', () => {
    beforeEach(seed);

    it('removes a need only', async () => {
      await provider.removeNeed('need-1');

      expect((await provider.getNeeds()).result.map((n) => n.id).sort()).toEqual(['need-2', 'need-3']);
      expect((await provider.getLocations()).result).toHaveLength(3);
    });

    it('removes the needs of a removed location', async () => {
      await provider.removeLocation('loc-1');

      expect((await provider.getLocations()).result.map((l) => l.id).sort()).toEqual(['loc-2', 'loc-3']);
      expect((await provider.getNeeds()).result.map((n) => n.id).sort()).toEqual(['need-2', 'need-3']);
    });

    it('removes the locations and needs of a removed organisation', async () => {
      await provider.removeOrganisation('org-1');

      expect((await provider.getOrganisations()).result.map((o) => o.id)).toEqual(['org-2']);
      expect((await provider.getLocations()).result.map((l) => l.id)).toEqual(['loc-3']);
      expect((await provider.getNeeds()).result.map((n) => n.id)).toEqual(['need-3']);
    });

    it('ignores removing an unknown organisation', async () => {
      await provider.removeOrganisation('nope');

      expect((await provider.getOrganisations()).result).toHaveLength(2);
    });
  });

  describe('accesses', () => {
    beforeEach(async () => {
      await provider.setAccess({ id: 'a1', code: 'secret-1', all: true });
      await provider.setAccess({ id: 'a2', code: 'secret-2', organisationIds: ['org-1'], translations: false });
    });

    it('filters accesses by code', async () => {
      expect((await provider.getAccesses({ code: 'secret-2' })).result.map((a) => a.id)).toEqual(['a2']);
      expect((await provider.getAccesses({ code: 'unknown' })).result).toEqual([]);
      expect((await provider.getAccesses()).result).toHaveLength(2);
    });

    it('gets and removes an access by id', async () => {
      expect((await provider.getAccess('a1')).result).toMatchObject({ code: 'secret-1' });

      await provider.removeAccess('a1');

      expect((await provider.getAccess('a1')).result).toBeUndefined();
    });
  });

  describe('translations', () => {
    it('falls back to the english defaults when the translation does not exist', async () => {
      const { result } = await provider.getTranslation('hu');

      expect(result).toEqual({ id: 'en', translations: translations.en });
    });

    it('overlays stored translations over the english defaults', async () => {
      const [firstKey, secondKey] = Object.keys(translations.en);
      await provider.setTranslations({ id: 'hu', translations: { [firstKey]: 'Magyar' } });

      const { result } = await provider.getTranslation('hu');

      expect(result.id).toBe('hu');
      expect(result.translations[firstKey]).toBe('Magyar');
      expect(result.translations[secondKey]).toBe(translations.en[secondKey]);
    });

    it('lists the stored translations', async () => {
      await provider.setTranslations({ id: 'hu', translations: {} });

      expect((await provider.getTranslations()).result.map((t) => t.id)).toEqual(['hu']);
    });
  });
});
