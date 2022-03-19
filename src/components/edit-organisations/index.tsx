import React, {FC, useCallback, useEffect, useState} from "react";
import {Organisation, OrganisationResource} from "../../types";
import {Box, Button, TextField} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import {useIntl} from "react-intl";
import EditOrganisation from "../edit-organisation";
import {sortByNames} from "../../utils";
import useApiClient from "../../hooks/useApiClient";

const EditOrganisations: FC = () => {
  const intl = useIntl();
  const api = useApiClient<'organisations'>('organisations')
  const [organisations, setOrganisations] = useState<OrganisationResource[]>([]);
  const [enteredText, setEnteredText] = useState('');
  const refresh = useCallback(() => {
    api.all().then(o => setOrganisations(o.sort(sortByNames)));
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);
  return (
    <>
      {organisations.map(organisation => (
        <EditOrganisation
          key={`edit-organisation-${organisation.id}`}
          id={organisation.id}
          initialOpen={false}
          initialState={organisation}
          onRemove={refresh}
        />
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
    </>
  );
};

export default EditOrganisations;
