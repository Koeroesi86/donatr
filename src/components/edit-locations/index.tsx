import React, {FC, useCallback, useEffect, useState} from "react";
import {CreateLocationResource, LocationResource} from "../../types";
import axios from "axios";
import {Accordion, AccordionDetails, AccordionSummary, Box, Button, Card, CardContent, TextField} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import debounce from "lodash.debounce";
import EditNeeds from "../edit-needs";
import {useIntl} from "react-intl";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const api = {
  all: (organisationId?: string): Promise<LocationResource[]> => {
    const url = new URL(window.location.origin);
    url.pathname = '/api/locations';
    if (organisationId) {
      url.searchParams.set('organisationId', organisationId);
    }
    return axios.get<LocationResource[]>(url.toJSON()).then(r => r.data);
  },
  one: (id: string): Promise<LocationResource> =>
    axios.get<LocationResource>(`/api/locations/${id}`).then(r => r.data),
  create: (data: CreateLocationResource): Promise<LocationResource[]> =>
    axios.post<LocationResource[]>('/api/locations', data).then(r => r.data),
  update: (data: LocationResource): Promise<LocationResource[]> =>
    axios.put<LocationResource[]>(`/api/locations/${data.id}`, data).then(r => r.data),
  remove: (data: LocationResource): Promise<void> =>
    axios.delete(`/api/locations/${data.id}`),
}

interface EditLocationsProps {
  ids?: string[];
  organisationId: string;
  initialOpen?: boolean;
}

const EditLocations: FC<EditLocationsProps> = ({ ids, organisationId, initialOpen = true }) => {
  const intl = useIntl();
  const [locations, setLocations] = useState<LocationResource[]>([]);
  const [enteredText, setEnteredText] = useState('');
  const debouncedUpdate = debounce((data: LocationResource) => {
    api.update(data).then(() => refresh());
  }, 2000);

  const refresh = useCallback(() => {
    (ids
        ? Promise.all(ids.map((id: string) => api.one(id)))
        : api.all(organisationId)
    )
      .then((l) => l.sort((a, b) => a.name.localeCompare(b.name)))
      .then(o => setLocations(o));
  }, [ids, organisationId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <Card>
      <CardContent>
        {locations.map(location => (
          <Accordion defaultExpanded={initialOpen} key={`edit-location-${location.id}`}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              {location.name}
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', my: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <TextField
                      label={intl.formatMessage({ id: 'input.location.name' })}
                      variant="standard"
                      defaultValue={location.name}
                      fullWidth
                      onChange={(e) => debouncedUpdate({
                        id: location.id,
                        organisationId: location.organisationId,
                        name: e.target.value,
                      })}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          debouncedUpdate({
                            id: location.id,
                            organisationId: location.organisationId,
                            // @ts-ignore
                            name: e.target.value,
                          });
                        }
                      }}
                    />
                  </Box>
                  <Box>
                    <Button
                      variant="contained"
                      onClick={() => {
                        if (!window.confirm(intl.formatMessage({ id: 'dialog.confirm.delete' }))) return;

                        api.remove(location).then(() => refresh());
                      }}
                    >
                      <DeleteIcon />
                    </Button>
                  </Box>
                </Box>
                <EditNeeds locationId={location.id} />
              </Box>
            </AccordionDetails>
          </Accordion>
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
