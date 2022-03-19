export interface RequestEvent {
  httpMethod: 'POST' | 'PUT'| 'GET' | 'DELETE' | 'OPTIONS';
  protocol: string;
  path: string;
  pathFragments: string[];
  queryStringParameters: { [key: string]: string };
  headers: { [key: string]: string };
  remoteAddress: string;
  body: string;
  rootPath: string;
}

export interface ResponseEvent {
  statusCode: number;
  headers?: { [key: string]: string };
  isBase64Encoded?: boolean;
  body?: string;
}

export type Worker = (event: RequestEvent, callback: (response: ResponseEvent) => void) => void | Promise<void>;

export interface PickedLocation {
  lat: number;
  lng: number;
  text: string;
}

export interface Translations {
  [k: string]: string;
}

export interface LocationsFilters {
  organisationId: string;
}

export interface NeedsFilters {
  locationId?: string;
  search?: string;
}

export interface FullAccess {
  id: string;
  all: true;
  translations?: boolean;
  code: string;
}

export interface OrganisationsAccess {
  id: string;
  organisationIds: string[];
  translations: boolean;
  code: string;
}

export interface LocationsAccess {
  id: string;
  locationIds: string[];
  translations: boolean;
  code: string;
}

export type Access = FullAccess | OrganisationsAccess | LocationsAccess;

export type AccessFilters = { code?: string; };

export interface NeedResource {
  id: string;
  locationId: string;
  name: string;
}

export interface LocationResource {
  id: string;
  organisationId: string;
  name: string;
  location?: PickedLocation,
}

export interface OrganisationResource {
  id: string;
  name: string;
  description?: string;
}

export interface TranslationsResource {
  id: string;
  translations: Translations;
}

export interface Organisation extends OrganisationResource{
}

export interface Location extends LocationResource {
}

export interface Need extends NeedResource {
  originalName: string;
}

export interface Translation extends TranslationsResource {
}

export type CreateNeedResource = Omit<NeedResource, 'id'>;
export type CreateLocationResource = Omit<LocationResource, 'id'>;
export type CreateOrganisationResource = Omit<OrganisationResource, 'id'>;

export type Resources = 'locations' | 'organisations' | 'needs' | 'access' | 'translations';

export interface PathToType {
  organisations: Organisation;
  locations: Location;
  needs: Need;
  translations: Translation;
  access: Access;
}

export interface PathToResource {
  organisations: OrganisationResource;
  locations: LocationResource;
  needs: NeedResource;
  translations: TranslationsResource;
  access: Access;
}

export interface PathToFilters {
  organisations: {};
  locations: LocationsFilters;
  needs: NeedsFilters;
  translations: {};
  access: AccessFilters;
}

export interface ProviderResult<T> {
  result: T;
  modified: number;
}

export interface Provider {
  getOrganisations: () => Promise<ProviderResult<OrganisationResource[]>>;
  getOrganisation: (id: string) => Promise<ProviderResult<OrganisationResource | undefined>>;
  getLocations: (p?: LocationsFilters) => Promise<ProviderResult<LocationResource[]>>;
  getLocation: (id: string, language?: string) => Promise<ProviderResult<LocationResource | undefined>>;
  getNeeds: (p?: NeedsFilters, language?: string) => Promise<ProviderResult<Need[]>>;
  getNeed: (id: string, language?: string) => Promise<ProviderResult<Need | undefined>>;
  getTranslations: () => Promise<ProviderResult<TranslationsResource[]>>;
  getTranslation: (code: string) => Promise<ProviderResult<TranslationsResource>>;
  setTranslations: (translation: TranslationsResource) => Promise<void>;
  setOrganisation: (organisation: OrganisationResource) => Promise<void>;
  removeOrganisation: (id: string) => Promise<void>;
  setLocation: (location: LocationResource) => Promise<void>;
  removeLocation: (id: string) => Promise<void>;
  setNeed: (location: NeedResource) => Promise<void>;
  removeNeed: (id: string) => Promise<void>;
  getAccesses: (filters?: AccessFilters) => Promise<ProviderResult<Access[]>>;
  getAccess: (code: string) => Promise<ProviderResult<Access | undefined>>;
  setAccess: (access: Access) => Promise<void>;
  removeAccess: (code: string) => Promise<void>;
}
