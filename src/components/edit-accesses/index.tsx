import React, {FC, useCallback, useEffect, useState} from "react";
import {Accordion, AccordionDetails, AccordionSummary, Box, Button, CircularProgress} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {FormattedMessage} from "react-intl";
import {Access} from "../../types";
import EditAccess from "../edit-access";
import EditAccessForm from "../edit-access-form";
import AddIcon from "@mui/icons-material/Add";
import useApiClient from "../../hooks/useApiClient";
import useOrganisations from "../../hooks/useOrganisations";

interface EditAccessesProps {
  currentCode: string;
}

const EditAccesses: FC<EditAccessesProps> = ({ currentCode }) => {
  const [accesses, setAccesses] = useState<Access[]>([]);
  const [newAccess, setNewAccess] = useState<Access>({ id: 'new', all: true, code: '' });
  const organisations = useOrganisations();
  const accessApi = useApiClient<'access'>('access');

  const refresh = useCallback(() => {
    accessApi.all().then((a) => setAccesses(a.sort((a, b) => a.code.localeCompare(b.code))));
  }, [accessApi]);

  const update = useCallback((data: Access) => {
    accessApi.update(data).then(() => refresh());
  }, [accessApi, refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!organisations) {
    return <CircularProgress />;
  }

  return (
    <>
      {accesses.filter((a) => a.code !== currentCode).map((access) => (
        <EditAccess
          key={`access-${access.id}`}
          access={access}
          onChange={update}
          organisations={organisations}
        />
      ))}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <FormattedMessage id="page.edit.accesses.new.title" />
        </AccordionSummary>
        <AccordionDetails>
          <EditAccessForm
            access={newAccess}
            organisations={organisations}
            onChange={setNewAccess}
          />
          <Box>
            <Button
              variant="contained"
              onClick={() => {
                const a = { ...newAccess };
                delete a.id;
                accessApi.create(a).then(() => {
                  refresh();
                  setNewAccess({ id: 'new', all: true, code: '' });
                });
              }}
            >
              <AddIcon />
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default EditAccesses;
