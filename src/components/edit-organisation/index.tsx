import React, {FC, useEffect, useState} from "react";
import {CreateOrganisationResource, OrganisationResource} from "../../types";
import {Box, Button, TextField} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditLocations from "../edit-locations";
import {useIntl} from "react-intl";
import debounce from "lodash.debounce";
import {ApiClient} from "../../utils";

const api = new ApiClient<OrganisationResource, CreateOrganisationResource>('organisations');

interface EditOrganisationProps {
  id: string;
}

const EditOrganisation: FC<EditOrganisationProps> = ({ id }) => {
  const intl = useIntl();
  const [organisation, setOrganisation] = useState<OrganisationResource>();

  const debouncedUpdate = debounce((data: OrganisationResource) => {
    api.update(data).then(() => api.one(data.id)).then(d => setOrganisation(d));
  }, 2000);

  useEffect(() => {
    api.one(id).then(o => setOrganisation(o))
  }, [id]);

  if (!organisation) return null;

  return (
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
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                debouncedUpdate({
                  id: organisation.id,
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

              api.remove(organisation).then(() => api.one(id)).then(setOrganisation);
            }}
          >
            <DeleteIcon />
          </Button>
        </Box>
      </Box>
      <EditLocations organisationId={organisation.id} />
    </Box>
  );
};

export default EditOrganisation;
