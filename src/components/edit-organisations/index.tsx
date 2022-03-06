import React, {FC, useEffect, useState} from "react";
import {CreateOrganisationResource, OrganisationResource} from "../../types";
import axios from "axios";
import {Box, Button, Card, CardContent, TextField} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import {useIntl} from "react-intl";
import EditOrganisation from "../edit-organisation";

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
  useEffect(() => {
    api.all().then(o => setOrganisations(o))
  }, []);
  return (
    <Card>
      <CardContent>
        {organisations.map(organisation => (
          <EditOrganisation key={organisation.id} id={organisation.id} />
        ))}
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', py: 1 }}>
          <Box sx={{ flexGrow: 1, px: 1 }}>
            <TextField
              label={intl.formatMessage({ id: 'input.organisation.name.new' })}
              variant="standard"
              fullWidth
              value={enteredText}
              onChange={(e) => setEnteredText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  api.create({name: enteredText}).then((o) => {
                    setEnteredText('');
                    setOrganisations(o);
                  });
                }
              }}
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
