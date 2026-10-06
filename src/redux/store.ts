import {configureStore, StateFromReducersMapObject} from "@reduxjs/toolkit";
import organisationsReducer from "./organisationsReducer";
import locationsReducer from "./locationsReducer";
import needsReducer from "./needsReducer";
import translationsReducer from "./translationsReducer";
import accessesReducer from "./accessesReducer";

const reducer = {
  locations: locationsReducer.reducer,
  organisations: organisationsReducer.reducer,
  needs: needsReducer.reducer,
  translations: translationsReducer.reducer,
  accesses: accessesReducer.reducer,
};

export const createStore = (preloadedState?: Partial<StateFromReducersMapObject<typeof reducer>>) =>
  configureStore({ reducer, preloadedState });

const store = createStore();

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
