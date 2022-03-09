import React, {FC, useCallback, useEffect, useState} from "react";
import {Location, LocationResource, LocationsFilters} from "../../types";
import {Box, Button, Card, CardContent, TextField} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import {useIntl} from "react-intl";
import EditLocation from "../edit-location";
import {ApiClient} from "../../utils";

// @ts-ignore
const api = new ApiClient<Location, 'needs', LocationsFilters>('locations');

interface EditLocationsProps {
  ids?: string[];
  organisationId: string;
  initialOpen?: boolean;
  initialState?: Location[];
}

const EditLocations: FC<EditLocationsProps> = ({ ids, organisationId, initialOpen = true, initialState = [] }) => {
  const intl = useIntl();
  const [locations, setLocations] = useState<LocationResource[]>(initialState);
  const [enteredText, setEnteredText] = useState('');

  const refresh = useCallback(() => {
    (ids
        ? Promise.all(ids.map((id: string) => api.one(id)))
        : api.all({ organisationId })
    )
      .then((l) => l.sort((a, b) => a.name.localeCompare(b.name)))
      .then(o => setLocations(o));
  }, [ids, organisationId]);

  useEffect(() => {
    if (!initialState.length) refresh();
  }, [refresh, initialState]);

  return (
    <Card>
      <CardContent>
        {locations.map(location => (
          <EditLocation
            key={`edit-location-${location.id}`}
            id={location.id}
            initialOpen={initialOpen}
            initialState={location}
          />
        ))}
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Box sx={{ flexGrow: 1 }}>
            <TextField
              label={intl.formatMessage({ id: 'input.location.name.new' })}
              variant="standard"
              fullWidth
              value={enteredText}
              onChange={(e) => setEnteredText(e.target.value)}
            />
          </Box>
          <Box>
            <Button
              variant="contained"
              disabled={!enteredText}
              onClick={() => {
                api.create({name: enteredText, organisationId}).then((o) => {
                  setEnteredText('');
                  setLocations(o);
                });
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  api.create({name: enteredText, organisationId}).then((o) => {
                    setEnteredText('');
                    setLocations(o);
                  });
                }
              }}
            >
              <AddIcon />
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EditLocations;
