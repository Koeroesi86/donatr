import {Location, Need, Organisation} from "../../types";

export const needs: Need[] = [
  {
    id: 'f32dbd74-5cce-4036-a1f4-e1fbb8770910',
    name: '1 loaf of bread',
    originalName: '1 loaf of bread',
    locationId: '576143b0-e316-4b16-84c4-53b15eecadec',
  }
];

export const locations: Location[] = [
  {
    id: '576143b0-e316-4b16-84c4-53b15eecadec',
    name: 'Test Location 1',
    organisationId: '6b70e880-0265-47e3-8c8d-a444f69bf7e6',
  }
];

export const organisations: Organisation[] = [
  {
    id: '6b70e880-0265-47e3-8c8d-a444f69bf7e6',
    name: 'Test Organisation 1',
  }
];
