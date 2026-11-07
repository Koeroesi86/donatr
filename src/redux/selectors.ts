import {createSelector} from "@reduxjs/toolkit";
import {AppState} from "./store";

const selectNeeds = createSelector([(state: AppState) => state.needs], (needs) => Object.values(needs));

const selectLocations = createSelector([(state: AppState) => state.locations], (locations) => Object.values(locations));

const selectOrganisations = createSelector([(state: AppState) => state.organisations], (organisations) => Object.values(organisations));

export const getNeed = (id: string) => (state: AppState) => state.needs[id];

export const getNeeds = () => selectNeeds;

export const getLocation = (id: string) => (state: AppState) => state.locations[id];

export const getLocations = () => selectLocations;

export const getOrganisation = (id: string) => (state: AppState) => state.organisations[id];

export const getOrganisations = () => selectOrganisations;
