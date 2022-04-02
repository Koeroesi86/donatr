import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Translation} from "../types";

interface TranslationCollection {
  [id: string]: Translation;
}

const translationsReducer = createSlice({
  name: 'translations',
  initialState: {} as TranslationCollection,
  reducers: {
    setLocation: (state, action: PayloadAction<Translation>) => ({
      ...state,
      [action.payload.id]: action.payload,
    }),
    setLocations: (state, action: PayloadAction<Translation[]>) =>
      action.payload.reduce(
        (result, current) => ({ ...result, [current.id]: current }),
        {} as TranslationCollection
      ),
  },
});

export default translationsReducer;
