import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Organisation} from "../types";

interface OrganisationCollection {
  [id: string]: Organisation;
}

const organisationsReducer = createSlice({
  name: 'organisations',
  initialState: {} as OrganisationCollection,
  reducers: {
    setOrganisation: (state, action: PayloadAction<Organisation>) => ({
      ...state,
      [action.payload.id]: action.payload,
    }),
    setOrganisations: (state, action: PayloadAction<Organisation[]>) =>
      action.payload.reduce(
        (result, current) => ({ ...result, [current.id]: current }),
        {} as OrganisationCollection
      ),
  },
});

export default organisationsReducer;
