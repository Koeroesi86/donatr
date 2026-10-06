import accessesReducer from "./accessesReducer";
import {Access} from "../types";

const { reducer, actions } = accessesReducer;
const access: Access = { id: 'a1', code: 'c', all: true };

describe('accessesReducer', () => {
  it('keeps accesses by id', () => {
    expect(reducer({}, actions.setAccess(access))).toEqual({ a1: access });
  });

  it('replaces the whole collection on bulk set', () => {
    const state = reducer({ old: access }, actions.setAccesses([{ ...access, id: 'a2' }]));

    expect(state).toEqual({ a2: { ...access, id: 'a2' } });
  });
});
