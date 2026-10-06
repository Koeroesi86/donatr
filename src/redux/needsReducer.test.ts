import needsReducer from "./needsReducer";
import {Need} from "../types";

const { reducer, actions } = needsReducer;
const need: Need = { id: 'n1', locationId: 'l1', name: 'Bread', originalName: 'Bread' };

describe('needsReducer', () => {
  it('keeps needs by id', () => {
    const state = reducer(reducer({}, actions.setNeed(need)), actions.setNeed({ ...need, id: 'n2' }));

    expect(Object.keys(state)).toEqual(['n1', 'n2']);
  });

  it('overwrites an existing need with the same id', () => {
    const state = reducer({ n1: need }, actions.setNeed({ ...need, name: 'Rye bread' }));

    expect(state.n1.name).toBe('Rye bread');
  });

  it('replaces the whole collection on bulk set', () => {
    const state = reducer({ old: { ...need, id: 'old' } }, actions.setNeeds([need]));

    expect(Object.keys(state)).toEqual(['n1']);
  });
});
