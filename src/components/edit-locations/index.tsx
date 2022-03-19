import React, {FC, useCallback, useEffect, useState} from "react";
import {Box, Button, Card, CardContent, TextField} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import {useIntl} from "react-intl";
import {LocationResource} from "../../types";
import EditLocation from "../edit-location";
import {sortByNames} from "../../utils";
import useApiClient from "../../hooks/useApiClient";

interface EditLocationsProps {
  ids?: string[];
  organisationId: string;
  initialOpen?: boolean;
  initialState?: LocationResource[];
}

const EditLocations: FC<EditLocationsProps> = ({ ids, organisationId, initialOpen = true, initialState = [] }) => {
  const intl = useIntl();
  const [locations, setLocations] = useState<LocationResource[]>(initialState.sort(sortByNames));
  const [enteredText, setEnteredText] = useState('');
  const api = useApiClient<'locations'>('locations');

  const refresh = useCallback(() => {
    (ids
        ? Promise.all(ids.map((id: string) => api.one(id)))
        : api.all({ organisationId })
    )
      .then((l) => l.sort(sortByNames))
      .then(o => setLocations(o));
  }, [api, ids, organisationId]);

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
            onRemove={refresh}
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
                api.create({name: enteredText, organisationId}).then(() => {
                  setEnteredText('');
                  refresh();
                });
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  api.create({name: enteredText, organisationId}).then(() => {
                    setEnteredText('');
                    refresh();
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
