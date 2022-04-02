

import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";
import locationsReducer from "./locationsReducer";
import organisationsReducer from "./organisationsReducer";
import needsReducer from "./needsReducer";
import {AppDispatch, AppState} from "./store";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
export const actions = {
  locations: locationsReducer.actions,
  organisations: organisationsReducer.actions,
  needs: needsReducer.actions,
};

export {default as store, AppDispatch, AppState} from './store';
