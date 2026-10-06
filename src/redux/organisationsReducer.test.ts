import organisationsReducer from "./organisationsReducer";
import {Organisation} from "../types";

const { reducer, actions } = organisationsReducer;
const organisation: Organisation = { id: 'o1', name: 'Org' };

describe('organisationsReducer', () => {
  it('keeps organisations by id', () => {
    const state = reducer(reducer({}, actions.setOrganisation(organisation)), actions.setOrganisation({ ...organisation, id: 'o2' }));

    expect(Object.keys(state)).toEqual(['o1', 'o2']);
  });

  it('overwrites an existing organisation with the same id', () => {
    const state = reducer({ o1: organisation }, actions.setOrganisation({ ...organisation, name: 'Renamed' }));

    expect(state.o1.name).toBe('Renamed');
  });

  it('replaces the whole collection on bulk set', () => {
    const state = reducer({ old: { id: 'old', name: 'Old' } }, actions.setOrganisations([organisation]));

    expect(Object.keys(state)).toEqual(['o1']);
  });
});
