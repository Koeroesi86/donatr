import {locations, needs, organisations} from "./mocks";
import {en} from "./translations";
import {Access, Provider} from "../types";

export default class MockProvider implements Provider {
  getLocations = () => Promise.resolve({ result: locations });
  getLocation = () => Promise.resolve({ result: locations[0] });
  getNeeds = () => Promise.resolve({ result: needs });
  getNeed = () => Promise.resolve({ result: needs[0] });
  getOrganisations = () => Promise.resolve({ result: organisations });
  getOrganisation = () => Promise.resolve({ result: organisations[0] });
  getTranslations = () => Promise.resolve({ result: [{ id: 'en', translations: en }] });
  getTranslation = () => Promise.resolve({ result: { id: 'en', translations: en } });
  setTranslations = () => Promise.resolve();
  removeLocation = () => Promise.resolve();
  removeNeed = () => Promise.resolve();
  removeOrganisation = () => Promise.resolve();
  setLocation = () => Promise.resolve();
  setNeed = () => Promise.resolve();
  setOrganisation = () => Promise.resolve();
  getAccess = (code: string) => Promise.resolve({ result: undefined });
  getAccesses = () => Promise.resolve({ result: [] });
  removeAccess = (code: string) => Promise.resolve();
  setAccess = (access: Access) => Promise.resolve();
}