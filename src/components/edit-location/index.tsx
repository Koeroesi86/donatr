import React, {FC, useCallback, useEffect, useState} from "react";
import {Box, Button, TextField} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditNeeds from "../edit-needs";
import {Location, LocationResource} from "../../types";
import {useIntl} from "react-intl";
import debounce from "lodash.debounce";
import {ApiClient} from "../../utils";

interface EditLocationProps {
  id: string;
  initialState?: LocationResource;
}

const api = new ApiClient<Location, 'needs', { organisationId?: string }>('locations');

const EditLocation: FC<EditLocationProps> = ({ id, initialState }) => {
  const intl = useIntl();
  const [location, setLocation] = useState<LocationResource>(initialState);
  const debouncedUpdate = debounce((data: LocationResource) => {
    api.update(data).then(() => refresh());
  }, 2000);

  const refresh = useCallback(() => {
    api.one(id).then((l) => setLocation(l));
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!location) {
    return null;
  }

  return (
    <Box key={location.id}>
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
  );
};

export default EditLocation;
