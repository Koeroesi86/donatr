import React, {FC, useCallback, useEffect, useState} from "react";
import {Access, AccessFilters, Organisation} from "../../types";
import {ApiClient} from "../../utils";
import EditAccess from "../edit-access";
import {useParams} from "react-router-dom";
import {Accordion, AccordionDetails, AccordionSummary, Box, Button} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditAccessForm from "../edit-access-form";
import DeleteIcon from "@mui/icons-material/Delete";
import {FormattedMessage} from "react-intl";

const api = new ApiClient<Access, undefined, AccessFilters>('access');
const apiOrganisation = new ApiClient<Organisation, 'locations'>('organisations');

const EditAccesses: FC = () => {
  const {code} = useParams();
  const [accesses, setAccesses] = useState<Access[]>([]);
  const [newAccess, setNewAccess] = useState<Access>({ id: 'new', all: true, code: '' });
  const [organisations, setOrganisations] = useState<Organisation[]>();

  const refresh = useCallback(() => {
    api.all().then((a) => setAccesses(a.sort((a, b) => a.code.localeCompare(b.code))));
    apiOrganisation.all().then(setOrganisations);
  }, []);

  const update = useCallback((data: Access) => {
    api.update(data).then(() => refresh());
  }, [refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!organisations) {
    return null;
  }

  return (
    <Accordion sx={{ my: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <FormattedMessage id="page.edit.accesses.title" />
      </AccordionSummary>
      <AccordionDetails>
        {accesses.filter((a) => a.code !== code).map((access) => (
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
                  api.create(a).then(() => {
                    refresh();
                    setNewAccess({ id: 'new', all: true, code: '' });
                  });
                }}
              >
                <DeleteIcon />
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>
      </AccordionDetails>
    </Accordion>
  );
};

export default EditAccesses;
