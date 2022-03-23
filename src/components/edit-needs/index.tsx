import React, {FC, useCallback, useEffect, useState} from "react";
import {Need} from "../../types";
import {Box, Button, Card, CardContent, TextField} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import {useIntl} from "react-intl";
import {sortByNames} from "../../utils";
import useApiClient from "../../hooks/useApiClient";
import EditNeed from "../edit-need";

interface EditNeedsProps {
  locationId: string;
  initialState?: Need[];
}

const EditNeeds: FC<EditNeedsProps> = ({ locationId, initialState = [] }) => {
  const intl = useIntl();
  const [needs, setNeeds] = useState<Need[]>(initialState.sort(sortByNames));
  const [enteredText, setEnteredText] = useState('');
  const api = useApiClient<'needs'>('needs');
  const refresh = useCallback(() => {
    api.all({ locationId })
      .then((l) => l.sort(sortByNames))
      .then(o => setNeeds(o));
  }, [api, locationId]);
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
        {needs.map((need) => (
          <EditNeed key={need.id} need={need} onRemove={refresh} onUpdate={refresh} />
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
