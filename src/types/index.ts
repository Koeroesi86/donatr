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

export interface Organisation {
  id: string;
  name: string;
  locations: Location[];
}

export interface Location {
  id: string;
  organisationId: string;
  name: string;
  needs: Need[];
}

export interface Need {
  id: string;
  locationId: string;
  name: string;
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

export type NeedResource = Need;
export type LocationResource = Omit<Location, 'needs'>;
export type OrganisationResource = Omit<Organisation, 'locations'>;
export interface TranslationsResource {
  id: string;
  translations: Translations;
}

export type CreateNeedResource = Omit<NeedResource, 'id'>;
export type CreateLocationResource = Omit<LocationResource, 'id'>;
export type CreateOrganisationResource = Omit<OrganisationResource, 'id'>;

export interface Provider {
  getOrganisations: () => Promise<Organisation[]>;
  getOrganisation: (id: string) => Promise<Organisation | undefined>;
  getLocations: (p?: LocationsFilters) => Promise<Location[]>;
  getLocation: (id: string) => Promise<Location | undefined>;
  getNeeds: (p?: NeedsFilters) => Promise<Need[]>;
  getNeed: (id: string) => Promise<Need | undefined>;
  getTranslations: () => Promise<TranslationsResource[]>;
  getTranslation: (code: string) => Promise<TranslationsResource>;
  setTranslations: (translation: TranslationsResource) => Promise<void>;
  setOrganisation: (organisation: Organisation) => Promise<void>;
  removeOrganisation: (id: string) => Promise<void>;
  setLocation: (location: LocationResource) => Promise<void>;
  removeLocation: (id: string) => Promise<void>;
  setNeed: (location: Need) => Promise<void>;
  removeNeed: (id: string) => Promise<void>;
  getAccesses: (filters?: AccessFilters) => Promise<Access[]>;
  getAccess: (code: string) => Promise<Access | undefined>;
  setAccess: (access: Access) => Promise<void>;
  removeAccess: (code: string) => Promise<void>;
}
