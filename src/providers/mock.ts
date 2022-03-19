import {locations, needs, organisations} from "./mocks";
import {en} from "./translations";
import {Access, Provider} from "../types";

export default class MockProvider implements Provider {
  getLocations = () => Promise.resolve({ result: locations, modified: 0 });
  getLocation = () => Promise.resolve({ result: locations[0], modified: 0 });
  getNeeds = () => Promise.resolve({ result: needs, modified: 0 });
  getNeed = () => Promise.resolve({ result: needs[0], modified: 0 });
  getOrganisations = () => Promise.resolve({ result: organisations, modified: 0 });
  getOrganisation = () => Promise.resolve({ result: organisations[0], modified: 0 });
  getTranslations = () => Promise.resolve({ result: [{ id: 'en', translations: en }], modified: 0 });
  getTranslation = () => Promise.resolve({ result: { id: 'en', translations: en }, modified: 0 });
  setTranslations = () => Promise.resolve();
  removeLocation = () => Promise.resolve();
  removeNeed = () => Promise.resolve();
  removeOrganisation = () => Promise.resolve();
  setLocation = () => Promise.resolve();
  setNeed = () => Promise.resolve();
  setOrganisation = () => Promise.resolve();
  getAccess = (code: string) => Promise.resolve({ result: undefined, modified: 0 });
  getAccesses = () => Promise.resolve({ result: [], modified: 0 });
  removeAccess = (code: string) => Promise.resolve();
  setAccess = (access: Access) => Promise.resolve();
}