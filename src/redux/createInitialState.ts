import {AppState} from "./store";

const createInitialState = (partials: Partial<AppState>): AppState => ({
  locations: {},
  organisations: {},
  needs: {},
  translations: {},
  accesses: {},
  ...partials,
});

export default createInitialState;
