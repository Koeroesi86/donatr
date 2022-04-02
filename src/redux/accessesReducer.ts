import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Access} from "../types";

interface AccessCollection {
  [id: string]: Access;
}

const accessesReducer = createSlice({
  name: 'accesses',
  initialState: {} as AccessCollection,
  reducers: {
    setAccess: (state, action: PayloadAction<Access>) => ({
      ...state,
      [action.payload.id]: action.payload,
    }),
    setAccesses: (state, action: PayloadAction<Access[]>) =>
      action.payload.reduce(
        (result, current) => ({ ...result, [current.id]: current }),
        {} as AccessCollection
      ),
  },
});

export default accessesReducer;
