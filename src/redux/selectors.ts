import {AppState} from "./store";

export const getNeed = (id: string) => (state: AppState) => state.needs[id];

export const getNeeds = () => (state: AppState) => Object.keys(state.needs).map((id) => state.needs[id]);

export const getLocation = (id: string) => (state: AppState) => state.locations[id];

export const getLocations = () => (state: AppState) => Object.keys(state.locations).map((id) => state.locations[id]);

export const getOrganisation = (id: string) => (state: AppState) => state.organisations[id];

export const getOrganisations = () => (state: AppState) => Object.keys(state.organisations).map((id) => state.organisations[id]);
