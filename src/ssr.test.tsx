import {RequestEvent, ResponseEvent, TranslationsResource} from "./types";

const mockApi = {
  all: jest.fn(),
  one: jest.fn(),
};

jest.mock('./utils/createApiClient', () => () => mockApi);
jest.mock('./utils/createKeepAliveCallback', () => () => jest.fn());
jest.mock('./utils/createScheduleGC', () => () => jest.fn());

// the server bundle replaces the leaflet modules with this shim as well (see webpack.config.mts)
jest.mock('leaflet', () => jest.requireActual('./components/ssr-react-leaflet'));
jest.mock('react-leaflet', () => jest.requireActual('./components/ssr-react-leaflet'));
jest.mock('leaflet-control-geocoder', () => jest.requireActual('./components/ssr-react-leaflet'));

const english: TranslationsResource = { id: 'en', translations: { 'site.name': 'Help Ukraine', 'page.home': 'Home' } };
const hungarian: TranslationsResource = { id: 'hu', translations: { 'site.name': 'Segítsünk Ukrajnán', 'page.home': 'Főoldal' } };

const request = (path: string, headers: RequestEvent['headers'] = {}): RequestEvent => ({
  httpMethod: 'GET',
  protocol: 'https',
  path,
  pathFragments: path.split('/').filter(Boolean),
  queryStringParameters: {},
  headers,
  remoteAddress: '127.0.0.1',
  body: '',
  rootPath: '/',
});

describe('ssr', () => {
  let call: (path: string, headers?: RequestEvent['headers']) => Promise<ResponseEvent>;

  beforeEach(async () => {
    jest.resetModules();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    process.env.PUBLIC_URL = 'https://donatr.test/';
    mockApi.all.mockReset().mockResolvedValue([english, hungarian]);
    mockApi.one.mockReset().mockResolvedValue(undefined);

    const { default: worker } = await import('./ssr');
    call = (path, headers) => new Promise((resolve) => worker(request(path, headers), resolve));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.PUBLIC_URL;
  });

  describe('manifest', () => {
    it('uses the translated site name', async () => {
      const response = await call('/manifest.json', { 'accept-language': 'hu' });
      const manifest = JSON.parse(response.body ?? '{}');

      expect(response.statusCode).toBe(200);
      expect(response.headers?.['content-type']).toContain('application/json');
      expect(manifest).toMatchObject({ name: 'Segítsünk Ukrajnán', short_name: 'Segítsünk Ukrajnán', start_url: '/' });
    });
  });

  describe('sitemap', () => {
    it('lists the public routes but not the edit area or the catch-all', async () => {
      const response = await call('/sitemap.xml');

      expect(response.statusCode).toBe(200);
      expect(response.headers?.['content-type']).toContain('application/xml');
      expect(response.body).toContain('<loc>https://donatr.test/organisations</loc>');
      expect(response.body).toContain('<loc>https://donatr.test/needs</loc>');
      expect(response.body).not.toContain('/edit');
      expect(response.body).not.toContain('*');
    });
  });

  describe('language', () => {
    it('picks the language from the cookie first', async () => {
      const response = await call('/', { cookie: 'language=hu', 'accept-language': 'en' });

      expect(response.body).toContain('lang="hu"');
    });

    it('falls back to the accept-language header', async () => {
      const response = await call('/', { 'accept-language': 'hu-HU,hu;q=0.9' });

      expect(response.body).toContain('lang="hu"');
    });

    it('ignores a cookie language that is not available', async () => {
      const response = await call('/', { cookie: 'language=xx', 'accept-language': 'hu' });

      expect(response.body).toContain('lang="hu"');
    });
  });

  describe('pages', () => {
    it('renders the main page as a complete html document', async () => {
      const response = await call('/');

      expect(response.statusCode).toBe(200);
      expect(response.headers?.['content-type']).toBe('text/html; charset=utf-8');
      expect(response.body?.startsWith('<!DOCTYPE html>')).toBe(true);
      expect(response.body).toContain('Help Ukraine');
    });

    it('renders known routes with 200 and unknown routes with 404', async () => {
      expect((await call('/needs')).statusCode).toBe(200);
      expect((await call('/contact')).statusCode).toBe(200);
      expect((await call('/edit')).statusCode).toBe(200);
      expect((await call('/this-does-not-exist')).statusCode).toBe(404);
    });

    it('renders an organisation page when the organisation exists', async () => {
      mockApi.one.mockResolvedValue({ id: 'org-1', name: 'Red Cross' });

      const response = await call('/organisations/org-1');

      expect(mockApi.one).toHaveBeenCalledWith('organisations', 'org-1');
      expect(response.statusCode).toBe(200);
      expect(response.body).toContain('Red Cross');
    });

    it('answers 404 for an organisation that does not exist', async () => {
      const response = await call('/organisations/missing');

      expect(response.statusCode).toBe(404);
    });

    it('renders a location page together with its organisation', async () => {
      mockApi.one.mockImplementation(async (resource: string) => resource === 'locations'
        ? { id: 'loc-1', organisationId: 'org-1', name: 'North Branch' }
        : { id: 'org-1', name: 'Red Cross' });

      const response = await call('/locations/loc-1');

      expect(mockApi.one).toHaveBeenCalledWith('organisations', 'org-1');
      expect(response.statusCode).toBe(200);
      expect(response.body).toContain('North Branch');
    });
  });

  describe('failures', () => {
    it('answers 400 with an empty page when the translations cannot be loaded', async () => {
      mockApi.all.mockRejectedValue(new Error('api down'));

      const response = await call('/');

      expect(response.statusCode).toBe(400);
      expect(response.body?.startsWith('<!DOCTYPE html>')).toBe(true);
    });

    it('answers 400 when no translation matches', async () => {
      mockApi.all.mockResolvedValue([]);

      expect((await call('/')).statusCode).toBe(400);
    });
  });
});
