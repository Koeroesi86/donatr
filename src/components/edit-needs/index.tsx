import React, {FC, useCallback, useEffect, useState} from "react";
import {NeedResource} from "../../types";
import {Box, Button, Card, CardContent, TextField} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import debounce from "lodash.debounce";
import {useIntl} from "react-intl";
import {sortByNames} from "../../utils";
import useApiClient from "../../hooks/useApiClient";

interface EditNeedsProps {
  locationId: string;
  initialState?: NeedResource[];
}

const EditNeeds: FC<EditNeedsProps> = ({ locationId, initialState = [] }) => {
  const intl = useIntl();
  const [needs, setNeeds] = useState<NeedResource[]>(initialState.sort(sortByNames));
  const [enteredText, setEnteredText] = useState('');
  const api = useApiClient<'needs'>('needs');
  const refresh = useCallback(() => {
    api.all({ locationId })
      .then((l) => l.sort(sortByNames))
      .then(o => setNeeds(o));
  }, [api, locationId]);
  const update = useCallback((data: NeedResource) => {
    api.update(data).then(() => refresh());
  }, [api, refresh]);
  const debouncedUpdate = useCallback(debounce(
    (data: NeedResource) => update(data),
    2000
  ), [update]);
  const create = useCallback(() => {
    api.create({name: enteredText, locationId}).then(() => {
      setEnteredText('');
      refresh();
    });
  }, [api, enteredText, locationId, refresh]);

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
                  if (typeof window !== 'undefined' && !window.confirm(intl.formatMessage({ id: 'dialog.confirm.delete' }))) return;

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
