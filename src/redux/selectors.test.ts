import createInitialState from "./createInitialState";
import {getLocation, getLocations, getNeed, getNeeds, getOrganisation, getOrganisations} from "./selectors";
import {Location, Need, Organisation} from "../types";

const organisation: Organisation = { id: 'o1', name: 'Org' };
const location: Location = { id: 'l1', organisationId: 'o1', name: 'Loc' };
const need: Need = { id: 'n1', locationId: 'l1', name: 'Bread', originalName: 'Bread' };

describe('selectors', () => {
  const state = createInitialState({
    organisations: { o1: organisation },
    locations: { l1: location },
    needs: { n1: need },
  });

  it('selects single items by id', () => {
    expect(getOrganisation('o1')(state)).toBe(organisation);
    expect(getLocation('l1')(state)).toBe(location);
    expect(getNeed('n1')(state)).toBe(need);
  });

  it('returns undefined for unknown ids', () => {
    expect(getOrganisation('nope')(state)).toBeUndefined();
    expect(getLocation('nope')(state)).toBeUndefined();
    expect(getNeed('nope')(state)).toBeUndefined();
  });

  it('selects whole collections as lists', () => {
    expect(getOrganisations()(state)).toEqual([organisation]);
    expect(getLocations()(state)).toEqual([location]);
    expect(getNeeds()(state)).toEqual([need]);
  });
});
