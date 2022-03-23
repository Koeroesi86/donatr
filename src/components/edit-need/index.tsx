import React, {FC, useCallback} from "react";
import {Box, Button, TextField} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {Need, NeedResource} from "../../types";
import {useIntl} from "react-intl";
import debounce from "lodash.debounce";
import useApiClient from "../../hooks/useApiClient";

interface EditNeedProps {
  need: Need;
  onUpdate: () => void | Promise<void>;
  onRemove: () => void | Promise<void>;
}

const EditNeed: FC<EditNeedProps> = ({ need, onUpdate, onRemove }) => {
  const intl = useIntl();
  const api = useApiClient<'needs'>('needs');
  const update = useCallback((data: NeedResource) => {
    api.update(data).then(() => onUpdate());
  }, [api, onUpdate]);
  const debouncedUpdate = useCallback(debounce(
    (data: NeedResource) => update(data),
    2000
  ), [update]);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', py: 1 }}>
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
            if (typeof window !== 'undefined' && !window.confirm(intl.formatMessage({ id: 'dialog.confirm.delete' }))) return;

            api.remove(need).then(() => onRemove());
          }}
        >
          <DeleteIcon />
        </Button>
      </Box>
    </Box>
  );
};

export default EditNeed;
