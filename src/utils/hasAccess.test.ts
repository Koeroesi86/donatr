import hasAccess from "./hasAccess";
import {Access} from "../types";

const fullAccess: Access = { id: '1', code: 'full', all: true, translations: false };
const organisationAccess: Access = { id: '2', code: 'org', organisationIds: ['org-1'], translations: false };
const locationAccess: Access = { id: '3', code: 'loc', locationIds: ['loc-1'], translations: true };

describe('hasAccess', () => {
  it('grants full access to everything', () => {
    expect(hasAccess({ all: true }, fullAccess)).toBe(true);
    expect(hasAccess({ accesses: true }, fullAccess)).toBe(true);
    expect(hasAccess({ organisationId: 'any' }, fullAccess)).toBe(true);
    expect(hasAccess({ locationId: 'any' }, fullAccess)).toBe(true);
  });

  it('limits organisation access to its own organisations', () => {
    expect(hasAccess({ organisationId: 'org-1' }, organisationAccess)).toBe(true);
    expect(hasAccess({ organisationId: 'org-2' }, organisationAccess)).toBe(false);
    expect(hasAccess({ locationId: 'loc-1' }, organisationAccess)).toBe(false);
  });

  it('limits location access to its own locations', () => {
    expect(hasAccess({ locationId: 'loc-1' }, locationAccess)).toBe(true);
    expect(hasAccess({ locationId: 'loc-2' }, locationAccess)).toBe(false);
    expect(hasAccess({ organisationId: 'org-1' }, locationAccess)).toBe(false);
  });

  it('only lets restricted accesses manage accesses and everything when they are full', () => {
    expect(hasAccess({ all: true }, organisationAccess)).toBe(false);
    expect(hasAccess({ accesses: true }, organisationAccess)).toBe(false);
    expect(hasAccess({ accesses: true }, locationAccess)).toBe(false);
  });

  it('grants translations based on the translations flag', () => {
    expect(hasAccess({ translations: true }, locationAccess)).toBe(true);
    expect(hasAccess({ translations: true }, organisationAccess)).toBe(false);
    expect(hasAccess({ translations: true }, fullAccess)).toBe(false);
  });

  it('denies when no condition is given', () => {
    expect(hasAccess({}, fullAccess)).toBe(false);
  });
});
