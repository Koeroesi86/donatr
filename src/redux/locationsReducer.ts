import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Location} from "../types";

interface LocationCollection {
  [id: string]: Location;
}

const locationsReducer = createSlice({
  name: 'locations',
  initialState: {} as LocationCollection,
  reducers: {
    setLocation: (state, action: PayloadAction<Location>) => ({
      ...state,
      [action.payload.id]: action.payload,
    }),
    setLocations: (state, action: PayloadAction<Location[]>) =>
      action.payload.reduce(
        (result, current) => ({ ...result, [current.id]: current }),
        {} as LocationCollection
      ),
  },
});

export default locationsReducer;
