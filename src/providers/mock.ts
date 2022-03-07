import {locations, needs, organisations} from "./mocks";
import {en} from "./translations";
import {Access, Provider} from "../types";

export default class MockProvider implements Provider {
  getLocations = () => Promise.resolve(locations);
  getLocation = () => Promise.resolve(locations[0]);
  getNeeds = () => Promise.resolve(needs);
  getNeed = () => Promise.resolve(needs[0]);
  getOrganisations = () => Promise.resolve(organisations);
  getOrganisation = () => Promise.resolve(organisations[0]);
  getTranslations = () => Promise.resolve(en);
  removeLocation = () => Promise.resolve();
  removeNeed = () => Promise.resolve();
  removeOrganisation = () => Promise.resolve();
  setLocation = () => Promise.resolve();
  setNeed = () => Promise.resolve();
  setOrganisation = () => Promise.resolve();
  getAccess = (code: string): Promise<Access | undefined> => Promise.resolve(undefined);
  getAccesses = (): Promise<Access[]> => Promise.resolve([]);
  removeAccess = (code: string): Promise<void> => Promise.resolve();
  setAccess = (access: Access): Promise<void> => Promise.resolve();
}