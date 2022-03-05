import path from 'path';
import fs from 'fs';
import {
  Location,
  LocationResource,
  LocationsFilters,
  Need, NeedResource,
  NeedsFilters,
  Organisation, OrganisationResource,
  Provider,
  Translations
} from "../types";
import * as translations from "./translations";

const getResourceIds = async (dirName: string): Promise<string[]> => {
  if (!fs.existsSync(dirName)) {
    return [];
  }

  const fileNames = await fs.promises.readdir(dirName);
  const ids = fileNames
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));

  return ids;
};

export default class JsonProvider implements Provider {
  private readonly basePath: string;

  constructor(props: { basePath: string }) {
    this.basePath = props.basePath;
  }

  getLocation = async (id: string): Promise<Location | undefined> => {
    const fileName = path.resolve(this.basePath, `./location/${id}.json`);

    if (!fs.existsSync(fileName)) return undefined;

    const content = fs.readFileSync(fileName, 'utf8');
    const location: LocationResource = JSON.parse(content);

    return {
      ...location,
      needs: await this.getNeeds({ locationId: location.id })
    };
  };

  getLocations = async (filters?: LocationsFilters): Promise<Location[]> => {
    const dirName = path.resolve(this.basePath, './location/');

    const ids = await getResourceIds(dirName);
    const allLocations = await Promise.all(ids.map(async (id) => this.getLocation(id)));

    return allLocations
      .filter(Boolean)
      .filter(l => filters && filters.organisationId ? l.organisationId === filters.organisationId : true);
  };

  getNeed = async (id: string): Promise<Need | undefined> => {
    const fileName = path.resolve(this.basePath, `./need/${id}.json`);

    if (!fs.existsSync(fileName)) return undefined;

    const content = fs.readFileSync(fileName, 'utf8');
    const need: NeedResource = JSON.parse(content);

    return need;
  };

  getNeeds = async (filters?: NeedsFilters): Promise<Need[]> => {
    const dirName = path.resolve(this.basePath, './need/');

    const ids = await getResourceIds(dirName);
    const allNeeds = await Promise.all(ids.map(async (id) => this.getNeed(id)));

    return allNeeds
      .filter(Boolean)
      .filter(n => filters && filters.search ? n.name.includes(filters.search) : true)
      .filter(n => filters && filters.locationId ? n.locationId === filters.locationId : true);
  };

  getOrganisation = async (id: string): Promise<Organisation | undefined> => {
    const fileName = path.resolve(this.basePath, `./organisation/${id}.json`);

    if (!fs.existsSync(fileName)) return undefined;

    const content = fs.readFileSync(fileName, 'utf8');
    const organisation: OrganisationResource = JSON.parse(content);

    return {
      ...organisation,
      locations: await this.getLocations({ organisationId: organisation.id })
    };
  };

  getOrganisations = async (): Promise<Organisation[]> => {
    const dirName = path.resolve(this.basePath, './organisation/');

    const ids = await getResourceIds(dirName);

    const o = await Promise.all(ids.map(async (id) => this.getOrganisation(id)));
    return o.filter(Boolean);
  };

  getTranslations = async (code: 'en' | 'hu'): Promise<Translations> => {
    return translations[code] ? translations[code] : translations.en;
  };

  removeLocation = async (id: string): Promise<void> => {
    const fileName = path.resolve(this.basePath, `./location/${id}.json`);

    if (!fs.existsSync(fileName)) return;

    await fs.promises.unlink(fileName);
  };

  removeNeed = async (id: string): Promise<void> => {
    const fileName = path.resolve(this.basePath, `./need/${id}.json`);

    if (!fs.existsSync(fileName)) return;

    await fs.promises.unlink(fileName);
  };

  removeOrganisation = async (id: string): Promise<void> => {
    const fileName = path.resolve(this.basePath, `./organisation/${id}.json`);

    if (!fs.existsSync(fileName)) return;

    await fs.promises.unlink(fileName);
  };

  setLocation = async (location: LocationResource): Promise<void> => {
    const fileName = path.resolve(this.basePath, `./location/${location.id}.json`);
    await fs.promises.writeFile(fileName, JSON.stringify(location, null, 2), 'utf8');
  };

  setNeed = async (need: NeedResource): Promise<void> => {
    const fileName = path.resolve(this.basePath, `./need/${need.id}.json`);
    await fs.promises.writeFile(fileName, JSON.stringify(need, null, 2), 'utf8');
  };

  setOrganisation = async (organisation: OrganisationResource): Promise<void> => {
    const fileName = path.resolve(this.basePath, `./organisation/${organisation.id}.json`);
    await fs.promises.writeFile(fileName, JSON.stringify(organisation, null, 2), 'utf8');
  };

}