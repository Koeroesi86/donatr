import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Need} from "../types";

interface NeedCollection {
  [id: string]: Need;
}

const needsReducer = createSlice({
  name: 'needs',
  initialState: {} as NeedCollection,
  reducers: {
    setNeed: (state, action: PayloadAction<Need>) => ({
      ...state,
      [action.payload.id]: action.payload,
    }),
    setNeeds: (state, action: PayloadAction<Need[]>) =>
      action.payload.reduce(
        (result, current) => ({ ...result, [current.id]: current }),
        {} as NeedCollection
      ),
  },
});

export default needsReducer;
