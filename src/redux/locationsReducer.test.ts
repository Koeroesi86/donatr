import locationsReducer from "./locationsReducer";
import {Location} from "../types";

const { reducer, actions } = locationsReducer;
const location: Location = { id: 'l1', organisationId: 'o1', name: 'Loc' };

describe('locationsReducer', () => {
  it('keeps locations by id', () => {
    const state = reducer(reducer({}, actions.setLocation(location)), actions.setLocation({ ...location, id: 'l2' }));

    expect(Object.keys(state)).toEqual(['l1', 'l2']);
  });

  it('overwrites an existing location with the same id', () => {
    const state = reducer({ l1: location }, actions.setLocation({ ...location, name: 'Renamed' }));

    expect(state.l1.name).toBe('Renamed');
  });

  it('replaces the whole collection on bulk set', () => {
    const state = reducer({ old: { ...location, id: 'old' } }, actions.setLocations([location]));

    expect(Object.keys(state)).toEqual(['l1']);
  });
});
