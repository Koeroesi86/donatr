import React, {FC, useEffect, useState} from "react";
import {CreateOrganisationResource, OrganisationResource} from "../../types";
import axios from "axios";
import {Box, Button, Card, CardContent, TextField} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import debounce from "lodash.debounce";
import EditLocations from "../edit-locations";
import {useIntl} from "react-intl";

const api = {
  all: (): Promise<OrganisationResource[]> =>
    axios.get<OrganisationResource[]>('/api/organisations').then(r => r.data),
  create: (data: CreateOrganisationResource): Promise<OrganisationResource[]> =>
    axios.post<OrganisationResource[]>('/api/organisations', data).then(r => r.data),
  update: (data: OrganisationResource): Promise<OrganisationResource> =>
    axios.put<OrganisationResource>(`/api/organisations/${data.id}`, data).then(r => r.data),
  remove: (data: OrganisationResource): Promise<void> =>
    axios.delete(`/api/organisations/${data.id}`),
}

const EditOrganisations: FC = () => {
  const intl = useIntl();
  const [organisations, setOrganisations] = useState<OrganisationResource[]>([]);
  const [enteredText, setEnteredText] = useState('');
  const debouncedUpdate = debounce((data: OrganisationResource) => {
    api.update(data).then(() => api.all()).then(d => setOrganisations(d));
  }, 2000);
  useEffect(() => {
    api.all().then(o => setOrganisations(o))
  }, []);
  return (
    <Card>
      <CardContent>
        {organisations.map(organisation => (
          <Box key={organisation.id}>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', py: 1 }}>
              <Box sx={{ flexGrow: 1, px: 1 }}>
                <TextField
                  label={intl.formatMessage({ id: 'input.organisation.name' })}
                  variant="standard"
                  defaultValue={organisation.name}
                  fullWidth
                  onChange={(e) => debouncedUpdate({
                    id: organisation.id,
                    name: e.target.value,
                  })}
                />
              </Box>
              <Box>
                <Button
                  variant="contained"
                  onClick={() => {
                    if (!window.confirm(intl.formatMessage({ id: 'dialog.confirm.delete' }))) return;

                    api.remove(organisation).then(() => api.all()).then(setOrganisations);
                  }}
                >
                  <DeleteIcon />
                </Button>
              </Box>
            </Box>
            <EditLocations organisationId={organisation.id} />
          </Box>
        ))}
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', py: 1 }}>
          <Box sx={{ flexGrow: 1, px: 1 }}>
            <TextField
              label={intl.formatMessage({ id: 'input.organisation.name.new' })}
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
                api.create({name: enteredText}).then((o) => {
                  setEnteredText('');
                  setOrganisations(o);
                });
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

export default EditOrganisations;
