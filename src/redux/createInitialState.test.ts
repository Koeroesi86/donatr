import createInitialState from "./createInitialState";
import {Need} from "../types";

describe('createInitialState', () => {
  it('creates empty collections', () => {
    expect(createInitialState({})).toEqual({
      locations: {}, organisations: {}, needs: {}, translations: {}, accesses: {},
    });
  });

  it('applies the given collections over the empty ones', () => {
    const need: Need = { id: 'n1', locationId: 'l1', name: 'Bread', originalName: 'Bread' };
    const state = createInitialState({ needs: { n1: need } });

    expect(state.needs).toEqual({ n1: need });
    expect(state.locations).toEqual({});
  });
});
