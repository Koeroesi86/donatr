import React, {FC, useCallback, useEffect, useState} from "react";
import {CreateNeedResource, NeedResource} from "../../types";
import axios from "axios";
import {Box, Button, Card, CardContent, TextField} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import debounce from "lodash.debounce";
import {useIntl} from "react-intl";

const api = {
  all: (locationId?: string): Promise<NeedResource[]> => {
    const url = new URL(window.location.origin);
    url.pathname = '/api/needs';
    if (locationId) {
      url.searchParams.set('locationId', locationId);
    }
    return axios.get<NeedResource[]>(url.toJSON()).then(r => r.data);
  },
  one: (id: string): Promise<NeedResource> =>
    axios.get<NeedResource>(`/api/needs/${id}`).then(r => r.data),
  create: (data: CreateNeedResource): Promise<NeedResource[]> =>
    axios.post<NeedResource[]>('/api/needs', data).then(r => r.data),
  update: (data: NeedResource): Promise<NeedResource[]> =>
    axios.put<NeedResource[]>(`/api/needs/${data.id}`, data).then(r => r.data),
  remove: (data: NeedResource): Promise<void> =>
    axios.delete(`/api/needs/${data.id}`),
}

interface EditNeedsProps {
  locationId: string;
  initialState?: NeedResource[];
}

const EditNeeds: FC<EditNeedsProps> = ({ locationId, initialState = [] }) => {
  const intl = useIntl();
  const [needs, setNeeds] = useState<NeedResource[]>(initialState.sort((a, b) => a.name.localeCompare(b.name)));
  const [enteredText, setEnteredText] = useState('');
  const refresh = useCallback(() => {
    api.all(locationId)
      .then((l) => l.sort((a, b) => a.name.localeCompare(b.name)))
      .then(o => setNeeds(o));
  }, [locationId]);
  const update = useCallback((data: NeedResource) => {
    api.update(data).then(() => refresh());
  }, [refresh]);
  const debouncedUpdate = useCallback(debounce(
    (data: NeedResource) => update(data),
    2000
  ), [update]);
  const create = useCallback(() => {
    api.create({name: enteredText, locationId}).then(() => {
      setEnteredText('');
      refresh();
    });
  }, [enteredText, locationId, refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <Card>
      <CardContent>
        {needs.map(need => (
          <Box key={need.id} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', py: 1 }}>
            <Box sx={{ flexGrow: 1, px: 1 }}>
              <TextField
                label={intl.formatMessage({ id: 'input.need.name' })}
                variant="standard"
                defaultValue={need.name}
                fullWidth
                onChange={(e) => debouncedUpdate({
                  id: need.id,
                  locationId: need.locationId,
                  name: e.target.value,
                })}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    update({
                      id: need.id,
                      locationId: need.locationId,
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

                  api.remove(need).then(() => refresh());
                }}
              >
                <DeleteIcon />
              </Button>
            </Box>
          </Box>
        ))}
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', py: 1 }}>
          <Box sx={{ flexGrow: 1, px: 1 }}>
            <TextField
              label={intl.formatMessage({ id: 'input.need.name.new' })}
              variant="standard"
              fullWidth
              value={enteredText}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  create();
                }
              }}
              onChange={(e) => setEnteredText(e.target.value)}
            />
          </Box>
          <Box>
            <Button
              variant="contained"
              disabled={!enteredText}
              onClick={() => create()}
            >
              <AddIcon />
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EditNeeds;
