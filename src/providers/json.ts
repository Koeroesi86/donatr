import path from 'path';
import {
  Access,
  AccessFilters,
  LocationResource,
  LocationsFilters,
  Need,
  NeedResource,
  NeedsFilters,
  OrganisationResource,
  Provider,
  ProviderResult,
  TranslationsResource,
} from "../types";
import * as translations from "./translations";
import JsonResource from "./jsonResource";
import translate from "./translate";

export default class JsonProvider implements Provider {
  private readonly basePath: string;
  private readonly locationResources: JsonResource<LocationResource>;
  private readonly needResources: JsonResource<NeedResource>;
  private readonly organisationResources: JsonResource<OrganisationResource>;
  private accessResources: JsonResource<Access>;
  private translationResources: JsonResource<TranslationsResource>;

  constructor(props: { basePath: string }) {
    this.basePath = props.basePath;

    const needResourcesPath = path.resolve(this.basePath, './need/');
    const locationResourcesPath = path.resolve(this.basePath, './location/');
    const organisationResourcesPath = path.resolve(this.basePath, './organisation/');
    const accessResourcesPath = path.resolve(this.basePath, './access/');
    const translationResourcesPath = path.resolve(this.basePath, './translation/');

    this.needResources = new JsonResource<NeedResource>(needResourcesPath);
    this.locationResources = new JsonResource<LocationResource>(locationResourcesPath);
    this.organisationResources = new JsonResource<OrganisationResource>(organisationResourcesPath);
    this.accessResources = new JsonResource<Access>(accessResourcesPath);
    this.translationResources = new JsonResource<TranslationsResource>(translationResourcesPath);
  }

  getLocation = async (id: string, language?: string): Promise<ProviderResult<LocationResource | undefined>> => {
    const location = await this.locationResources.one(id);

    return { result: location };
  };

  getLocations = async (filters?: LocationsFilters): Promise<ProviderResult<LocationResource[]>> => {
    const ids = await this.locationResources.getIds();
    const allLocations = await Promise.all(
      ids.map(async (id) => await this.getLocation(id))
    );

    return {
      result: allLocations
        .map((l) => l.result)
        .filter(Boolean)
        .filter(l => filters && filters.organisationId ? l.organisationId === filters.organisationId : true),
    };
  };

  getNeed = async (id: string, language?: string): Promise<ProviderResult<Need | undefined>> => {
    const need = await this.needResources.one(id);
    return {
      result: !need ? undefined : {
        ...need,
        name: language ? await translate(need.name, language) : need.name,
        originalName: need.name,
      },
    };
  };

  getNeeds = async (filters?: NeedsFilters, language?: string): Promise<ProviderResult<Need[]>> => {
    let allNeeds: Need[] = (await this.needResources.all()).map((n) => ({ ...n, originalName: n.name }));

    if (language) {
      allNeeds = await Promise.all(allNeeds.map(async (need) => ({
        ...need,
        name: await translate(need.name, language),
        originalName: need.name,
      })));
    }

    return {
      result: allNeeds
        .filter(n => filters && filters.search ? n.name.includes(filters.search) : true)
        .filter(n => filters && filters.locationId ? n.locationId === filters.locationId : true),
    };
  };

  getOrganisation = async (id: string): Promise<ProviderResult<OrganisationResource | undefined>> => {
    const organisation = await this.organisationResources.one(id);

    return { result: organisation };
  };

  getOrganisations = async (): Promise<ProviderResult<OrganisationResource[]>> => {
    const ids = await this.organisationResources.getIds();
    const result = await Promise.all(
      ids.map(async (id) => this.getOrganisation(id))
    );

    return { result: result.map((r) => r.result).filter(Boolean) };
  };

  getTranslation = async (code: string): Promise<ProviderResult<TranslationsResource>> => {
    const translation = await this.translationResources.one(code);

    if (!translation) {
      return {
        result: {
          id: 'en',
          translations: translations.en,
        }
      };
    }

    return {
      result: {
        ...translation,
        translations: {
          ...translations.en,
          ...translation.translations,
        },
      }
    };
  };

  getTranslations = async (): Promise<ProviderResult<TranslationsResource[]>> => {
    return {
      result: await this.translationResources.all(),
    };
  }

  setTranslations = async (translations: TranslationsResource): Promise<void> => {
    await this.translationResources.set(translations);
  };

  removeLocation = async (id: string): Promise<void> => {
    const location = await this.getLocation(id);

    if (!location) {
      return;
    }

    const needs = await this.getNeeds({ locationId: id });
    await Promise.all(needs.result.map((async (need) => this.removeNeed(need.id))));
    await this.locationResources.remove(id);
  };

  removeNeed = async (id: string): Promise<void> => {
    await this.needResources.remove(id);
  };

  removeOrganisation = async (id: string): Promise<void> => {
    const organisation = await this.getOrganisation(id);

    if (!organisation) {
      return;
    }

    const locations = await this.getLocations({ organisationId: id });
    await Promise.all(locations.result.map((async (location) => this.removeLocation(location.id))));
    await this.organisationResources.remove(id);
  };

  setLocation = async (location: LocationResource): Promise<void> => {
    await this.locationResources.set(location);
  };

  setNeed = async (need: NeedResource): Promise<void> => {
    await this.needResources.set(need);
  };

  setOrganisation = async (organisation: OrganisationResource): Promise<void> => {
    await this.organisationResources.set(organisation);
  };

  getAccesses = async (filters?: AccessFilters): Promise<ProviderResult<Access[]>> => {
    const results = await this.accessResources.all();
    return {
      result: results
        .filter((access) => filters && filters.code ? access.code === filters.code : true)
    };
  };

  getAccess = async (id: string): Promise<ProviderResult<Access | undefined>> => {
    return { result: await this.accessResources.one(id) };
  };

  setAccess = async (access: Access): Promise<void> => {
    await this.accessResources.set(access);
  };

  removeAccess = async (id: string): Promise<void> => {
    await this.accessResources.remove(id);
  };

}