import path from 'path';
import {
  Location,
  LocationResource,
  LocationsFilters,
  Need,
  NeedResource,
  NeedsFilters,
  Organisation,
  OrganisationResource,
  Provider,
  Translations
} from "../types";
import * as translations from "./translations";
import JsonResource from "./jsonResource";

export default class JsonProvider implements Provider {
  private readonly basePath: string;
  private readonly locationResources: JsonResource<LocationResource>;
  private readonly needResources: JsonResource<NeedResource>;
  private readonly organisationResources: JsonResource<OrganisationResource>;

  constructor(props: { basePath: string }) {
    this.basePath = props.basePath;

    this.needResources = new JsonResource<NeedResource>(path.resolve(this.basePath, './need/'));
    this.locationResources = new JsonResource<LocationResource>(path.resolve(this.basePath, './location/'));
    this.organisationResources = new JsonResource<OrganisationResource>(path.resolve(this.basePath, './organisation/'));
  }

  getLocation = async (id: string): Promise<Location | undefined> => {
    const location = await this.locationResources.one(id);

    if (!location) {
      return undefined;
    }

    return {
      ...location,
      needs: await this.getNeeds({ locationId: location.id })
    };
  };

  getLocations = async (filters?: LocationsFilters): Promise<Location[]> => {
    const allLocations = await Promise.all(
      (await this.locationResources.all())
        .map(async (loc) => ({ ...loc, ...await this.getLocation(loc.id) }))
    );

    return allLocations
      .filter(l => filters && filters.organisationId ? l.organisationId === filters.organisationId : true);
  };

  getNeed = async (id: string): Promise<Need | undefined> => {
    return this.needResources.one(id);
  };

  getNeeds = async (filters?: NeedsFilters): Promise<Need[]> => {
    const allNeeds = await this.needResources.all();

    return allNeeds
      .filter(n => filters && filters.search ? n.name.includes(filters.search) : true)
      .filter(n => filters && filters.locationId ? n.locationId === filters.locationId : true);
  };

  getOrganisation = async (id: string): Promise<Organisation | undefined> => {
    const organisation = await this.organisationResources.one(id);

    if (!organisation) {
      return undefined;
    }

    return {
      ...organisation,
      locations: await this.getLocations({ organisationId: organisation.id })
    };
  };

  getOrganisations = async (): Promise<Organisation[]> => {
    const organisations = await this.organisationResources.all();
    return Promise.all(organisations.map(async (organisation) => ({
      ...organisation,
      ...await this.getOrganisation(organisation.id)
    })));
  };

  getTranslations = async (code: 'en' | 'hu'): Promise<Translations> => {
    return translations[code] ? translations[code] : translations.en;
  };

  removeLocation = async (id: string): Promise<void> => {
    const location = await this.getLocation(id);

    if (!location) {
      return;
    }

    await Promise.all(location.needs.map((async (need) => this.removeNeed(need.id))));
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

    await Promise.all(organisation.locations.map((async (location) => this.removeLocation(location.id))));
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

}