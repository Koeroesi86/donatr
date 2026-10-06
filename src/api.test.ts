/**
 * @jest-environment node
 */
import fs from "node:fs";
import path from "node:path";
import {Access, RequestEvent, ResponseEvent} from "./types";
import {createTempDir, removeDir} from "./test/createTempDir";

jest.mock('./utils/createKeepAliveCallback', () => () => jest.fn());
jest.mock('./utils/createScheduleGC', () => () => jest.fn());

const fullAccess: Access = { id: 'a-full', code: 'full-code', all: true, translations: true };
const orgAccess: Access = { id: 'a-org', code: 'org-code', organisationIds: ['org-1'], translations: false };
const locationAccess: Access = { id: 'a-loc', code: 'loc-code', locationIds: ['loc-1'], translations: false };
const translatorAccess: Access = { id: 'a-tr', code: 'tr-code', locationIds: [], translations: true };

const seedData: Record<string, Record<string, object>> = {
  organisation: {
    'org-1': { id: 'org-1', name: 'Red Cross' },
    'org-2': { id: 'org-2', name: 'Food Bank' },
  },
  location: {
    'loc-1': { id: 'loc-1', organisationId: 'org-1', name: 'North' },
    'loc-2': { id: 'loc-2', organisationId: 'org-2', name: 'South' },
  },
  need: {
    'need-1': { id: 'need-1', locationId: 'loc-1', name: 'Bread' },
    'need-2': { id: 'need-2', locationId: 'loc-2', name: 'Blankets' },
  },
  access: Object.fromEntries([fullAccess, orgAccess, locationAccess, translatorAccess].map((a) => [a.id, a])),
};

interface Call {
  body?: unknown;
  token?: string;
  query?: Record<string, string>;
  headers?: Record<string, string>;
}

// The tests read arbitrary parts of the parsed response bodies
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Api = (method: RequestEvent['httpMethod'], url: string, call?: Call) => Promise<ResponseEvent & { json: any }>;

describe('api', () => {
  let dir: string;
  let call: Api;
  let tokenFor: (access: Access) => Promise<string>;

  const readJson = (kind: string, id: string) =>
    JSON.parse(fs.readFileSync(path.join(dir, kind, `${id}.json`), 'utf8'));
  const exists = (kind: string, id: string) => fs.existsSync(path.join(dir, kind, `${id}.json`));

  beforeEach(async () => {
    jest.resetModules();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    dir = createTempDir();
    Object.entries(seedData).forEach(([kind, items]) => {
      fs.mkdirSync(path.join(dir, kind), { recursive: true });
      Object.entries(items).forEach(([id, item]) =>
        fs.writeFileSync(path.join(dir, kind, `${id}.json`), JSON.stringify(item)));
    });
    process.env.DATA_BASE_PATH = dir;

    const { default: worker } = await import('./api');
    const token = await import('./utils/token');
    tokenFor = token.serialize;
    call = (httpMethod, url, { body, token: accessToken, query = {}, headers = {} } = {}) =>
      new Promise((resolve) => {
        const pathFragments = url.split('/').filter(Boolean);
        worker({
          httpMethod,
          protocol: 'http',
          path: url,
          pathFragments,
          queryStringParameters: query,
          headers: { ...(accessToken ? { 'x-access-token': accessToken } : {}), ...headers },
          remoteAddress: '127.0.0.1',
          body: body === undefined ? '' : typeof body === 'string' ? body : JSON.stringify(body),
          rootPath: '/',
        }, (response) => resolve({ ...response, json: response.body ? JSON.parse(response.body) : undefined }));
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.DATA_BASE_PATH;
    removeDir(dir);
  });

  describe('reading', () => {
    it('lists organisations publicly', async () => {
      const response = await call('GET', '/api/organisations');

      expect(response.statusCode).toBe(200);
      expect(response.json.map((o: { id: string }) => o.id).sort()).toEqual(['org-1', 'org-2']);
      expect(response.headers).toMatchObject({
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      });
    });

    it('answers 304 without a body when the etag still matches', async () => {
      const first = await call('GET', '/api/organisations');
      const second = await call('GET', '/api/organisations', { headers: { 'if-none-match': first.headers?.ETag ?? '' } });

      expect(first.headers?.ETag).toBeTruthy();
      expect(second.statusCode).toBe(304);
      expect(second.body).toBe('');
    });

    it('filters locations by organisation and needs by search and location', async () => {
      const locations = await call('GET', '/api/locations', { query: { organisationId: 'org-1' } });
      const needs = await call('GET', '/api/needs', { query: { locationId: 'loc-2' } });
      const search = await call('GET', '/api/needs', { query: { search: 'Bread' } });

      expect(locations.json.map((l: { id: string }) => l.id)).toEqual(['loc-1']);
      expect(needs.json.map((n: { id: string }) => n.id)).toEqual(['need-2']);
      expect(search.json.map((n: { id: string }) => n.id)).toEqual(['need-1']);
    });

    it('serves single resources', async () => {
      expect((await call('GET', '/api/organisations/org-1')).json).toMatchObject({ name: 'Red Cross' });
      expect((await call('GET', '/api/locations/loc-1')).json).toMatchObject({ name: 'North' });
      expect((await call('GET', '/api/needs/need-1')).json).toMatchObject({ name: 'Bread', originalName: 'Bread' });
    });

    it('serves translations with english defaults', async () => {
      const response = await call('GET', '/api/translations/en');

      expect(response.statusCode).toBe(200);
      expect(response.json.translations['site.name']).toBeTruthy();
    });

    it('answers 404 for unknown endpoints', async () => {
      expect((await call('GET', '/api/nope')).statusCode).toBe(404);
      expect((await call('GET', '/api/organisations/a/b/c')).statusCode).toBe(404);
    });
  });

  describe('organisations', () => {
    it('lets only full access create an organisation, with a server generated id', async () => {
      const created = await call('POST', '/api/organisations', {
        token: await tokenFor(fullAccess),
        body: { id: 'chosen-by-client', name: 'New Org' },
      });

      expect(created.statusCode).toBe(200);
      expect(exists('organisation', 'chosen-by-client')).toBe(false);
      expect(readJson('organisation', 'id-1')).toEqual({ id: 'id-1', name: 'New Org' });
    });

    it('rejects creating an organisation with restricted access', async () => {
      const response = await call('POST', '/api/organisations', {
        token: await tokenFor(orgAccess),
        body: { name: 'Sneaky' },
      });

      expect(response.statusCode).toBe(401);
      expect(fs.readdirSync(path.join(dir, 'organisation')).sort()).toEqual(['org-1.json', 'org-2.json']);
    });

    it('rejects creating an organisation without a token', async () => {
      const response = await call('POST', '/api/organisations', { body: { name: 'Anonymous' } });

      expect(response.statusCode).toBeGreaterThanOrEqual(400);
      expect(fs.readdirSync(path.join(dir, 'organisation'))).toHaveLength(2);
    });

    it('rejects a forged token', async () => {
      const [header, , signature] = (await tokenFor(orgAccess)).split('.');
      const forged = `${header}.${Buffer.from(JSON.stringify({ access: fullAccess })).toString('base64url')}.${signature}`;

      const response = await call('POST', '/api/organisations', { token: forged, body: { name: 'Forged' } });

      expect(response.statusCode).toBeGreaterThanOrEqual(400);
      expect(fs.readdirSync(path.join(dir, 'organisation'))).toHaveLength(2);
    });

    it('lets the owner update its organisation but not another one', async () => {
      const token = await tokenFor(orgAccess);

      const own = await call('PUT', '/api/organisations/org-1', { token, body: { id: 'org-1', name: 'Renamed' } });
      const other = await call('PUT', '/api/organisations/org-2', { token, body: { id: 'org-2', name: 'Hijacked' } });

      expect(own.statusCode).toBe(200);
      expect(readJson('organisation', 'org-1').name).toBe('Renamed');
      expect(other.statusCode).toBe(401);
      expect(readJson('organisation', 'org-2').name).toBe('Food Bank');
    });

    it('rejects an update whose body id differs from the url id', async () => {
      const response = await call('PUT', '/api/organisations/org-1', {
        token: await tokenFor(fullAccess),
        body: { id: 'org-2', name: 'Mismatch' },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json.message).toBe('Invalid ID');
      expect(readJson('organisation', 'org-2').name).toBe('Food Bank');
    });

    it('lets the owner delete its organisation together with its locations and needs', async () => {
      const response = await call('DELETE', '/api/organisations/org-1', { token: await tokenFor(orgAccess) });

      expect(response.statusCode).toBe(200);
      expect(exists('organisation', 'org-1')).toBe(false);
      expect(exists('location', 'loc-1')).toBe(false);
      expect(exists('need', 'need-1')).toBe(false);
      expect(exists('organisation', 'org-2')).toBe(true);
      expect(exists('location', 'loc-2')).toBe(true);
    });

    it('rejects deleting another organisation', async () => {
      const response = await call('DELETE', '/api/organisations/org-2', { token: await tokenFor(orgAccess) });

      expect(response.statusCode).toBe(401);
      expect(exists('organisation', 'org-2')).toBe(true);
    });

    it('rejects deleting an organisation with location access', async () => {
      const response = await call('DELETE', '/api/organisations/org-1', { token: await tokenFor(locationAccess) });

      expect(response.statusCode).toBe(401);
      expect(exists('organisation', 'org-1')).toBe(true);
    });
  });

  describe('locations', () => {
    it('lets an organisation owner create a location in its organisation', async () => {
      const response = await call('POST', '/api/locations', {
        token: await tokenFor(orgAccess),
        body: { organisationId: 'org-1', name: 'West' },
      });

      expect(response.statusCode).toBe(200);
      expect(readJson('location', 'id-1')).toEqual({ id: 'id-1', organisationId: 'org-1', name: 'West' });
    });

    it('rejects creating a location in someone elses organisation', async () => {
      const response = await call('POST', '/api/locations', {
        token: await tokenFor(orgAccess),
        body: { organisationId: 'org-2', name: 'West' },
      });

      expect(response.statusCode).toBe(401);
      expect(fs.readdirSync(path.join(dir, 'location'))).toHaveLength(2);
    });

    it('rejects creating a location with location-only access', async () => {
      const response = await call('POST', '/api/locations', {
        token: await tokenFor(locationAccess),
        body: { organisationId: 'org-1', name: 'West' },
      });

      expect(response.statusCode).toBe(401);
    });

    it.each([
      ['location access for the location', locationAccess, 'loc-1', 200],
      ['organisation access for a location of the organisation', orgAccess, 'loc-1', 200],
      ['location access for another location', locationAccess, 'loc-2', 401],
      ['organisation access for a location of another organisation', orgAccess, 'loc-2', 401],
    ])('updating with %s', async (_, access, locationId, status) => {
      const location = seedData.location[locationId] as { organisationId: string };
      const response = await call('PUT', `/api/locations/${locationId}`, {
        token: await tokenFor(access),
        body: { id: locationId, organisationId: location.organisationId, name: 'Updated' },
      });

      expect(response.statusCode).toBe(status);
      expect(readJson('location', locationId).name).toBe(status === 200 ? 'Updated' : (seedData.location[locationId] as { name: string }).name);
    });

    it('deletes a location with its needs when allowed', async () => {
      const response = await call('DELETE', '/api/locations/loc-1', { token: await tokenFor(locationAccess) });

      expect(response.statusCode).toBe(200);
      expect(exists('location', 'loc-1')).toBe(false);
      expect(exists('need', 'need-1')).toBe(false);
      expect(exists('need', 'need-2')).toBe(true);
    });

    it('does not delete a location when not allowed', async () => {
      const response = await call('DELETE', '/api/locations/loc-2', { token: await tokenFor(locationAccess) });

      expect(response.statusCode).toBe(401);
      expect(exists('location', 'loc-2')).toBe(true);
    });
  });

  describe('needs', () => {
    it('lets location access create a need in its location', async () => {
      const response = await call('POST', '/api/needs', {
        token: await tokenFor(locationAccess),
        body: { locationId: 'loc-1', name: 'Water' },
      });

      expect(response.statusCode).toBe(200);
      expect(readJson('need', 'id-1')).toEqual({ id: 'id-1', locationId: 'loc-1', name: 'Water' });
    });

    it('lets organisation access create a need in a location of its organisation', async () => {
      const response = await call('POST', '/api/needs', {
        token: await tokenFor(orgAccess),
        body: { locationId: 'loc-1', name: 'Water' },
      });

      expect(response.statusCode).toBe(200);
    });

    it('rejects creating a need in a foreign location', async () => {
      const response = await call('POST', '/api/needs', {
        token: await tokenFor(locationAccess),
        body: { locationId: 'loc-2', name: 'Water' },
      });

      expect(response.statusCode).toBe(401);
      expect(fs.readdirSync(path.join(dir, 'need'))).toHaveLength(2);
    });

    it('updates and deletes needs of the own location only', async () => {
      const token = await tokenFor(locationAccess);

      const own = await call('PUT', '/api/needs/need-1', { token, body: { id: 'need-1', locationId: 'loc-1', name: 'Rye bread' } });
      const foreign = await call('PUT', '/api/needs/need-2', { token, body: { id: 'need-2', locationId: 'loc-2', name: 'Hijacked' } });
      const foreignDelete = await call('DELETE', '/api/needs/need-2', { token });
      const ownDelete = await call('DELETE', '/api/needs/need-1', { token });

      expect(own.statusCode).toBe(200);
      expect(foreign.statusCode).toBe(401);
      expect(foreignDelete.statusCode).toBe(401);
      expect(ownDelete.statusCode).toBe(200);
      expect(readJson('need', 'need-2').name).toBe('Blankets');
      expect(exists('need', 'need-1')).toBe(false);
    });
  });

  describe('translations', () => {
    it('lets only accesses with the translations flag update translations', async () => {
      const body = { id: 'hu', translations: { 'site.name': 'Segítsünk' } };

      const denied = await call('PUT', '/api/translations/hu', { token: await tokenFor(orgAccess), body });
      const allowed = await call('PUT', '/api/translations/hu', { token: await tokenFor(translatorAccess), body });

      expect(denied.statusCode).toBe(401);
      expect(allowed.statusCode).toBe(200);
      expect(readJson('translation', 'hu').translations['site.name']).toBe('Segítsünk');
    });
  });

  describe('access management', () => {
    it.each([
      ['organisation', orgAccess],
      ['location', locationAccess],
      ['translator', translatorAccess],
    ])('hides the access list from %s access', async (_, access) => {
      const response = await call('GET', '/api/access', { token: await tokenFor(access) });

      expect(response.statusCode).toBe(401);
    });

    it('hides the access list from anonymous requests', async () => {
      expect((await call('GET', '/api/access')).statusCode).toBeGreaterThanOrEqual(400);
    });

    it('lets full access list, create, update and delete accesses', async () => {
      const token = await tokenFor(fullAccess);

      const list = await call('GET', '/api/access', { token });
      const created = await call('POST', '/api/access', { token, body: { code: 'new-code', all: true } });
      const updated = await call('PUT', '/api/access/a-org', { token, body: { ...orgAccess, code: 'changed' } });
      const removed = await call('DELETE', '/api/access/a-loc', { token });

      expect(list.json).toHaveLength(4);
      expect(created.json.map((a: Access) => a.id)).toContain('id-1');
      expect(updated.statusCode).toBe(200);
      expect(readJson('access', 'a-org').code).toBe('changed');
      expect(removed.statusCode).toBe(200);
      expect(exists('access', 'a-loc')).toBe(false);
    });
  });

  describe('resolving access', () => {
    it('exchanges a valid code for the access and a token carrying it', async () => {
      const response = await call('GET', '/api/resolve-access/org-code');
      const { deserialize } = await import('./utils/token');

      expect(response.statusCode).toBe(200);
      expect(response.json).toEqual(orgAccess);
      expect(await deserialize(response.headers?.['x-access-token'] ?? '')).toEqual(orgAccess);
    });

    it('decodes url encoded codes', async () => {
      await call('PUT', '/api/access/a-org', { token: await tokenFor(fullAccess), body: { ...orgAccess, code: 'a b/c' } });

      expect((await call('GET', `/api/resolve-access/${encodeURIComponent('a b/c')}`)).statusCode).toBe(200);
    });

    it('answers 404 for an unknown code and issues no token', async () => {
      const response = await call('GET', '/api/resolve-access/unknown');

      expect(response.statusCode).toBe(404);
      expect(response.headers?.['x-access-token']).toBeUndefined();
    });
  });

  describe('errors', () => {
    it('answers 400 with a message for an invalid json body', async () => {
      const response = await call('PUT', '/api/organisations/org-1', { token: await tokenFor(fullAccess), body: '{not json' });

      expect(response.statusCode).toBe(400);
      expect(response.json.message).toContain('JSON');
      expect(readJson('organisation', 'org-1').name).toBe('Red Cross');
    });
  });
});
