import React, {FC, useEffect, useState} from "react";
import {Accordion, AccordionDetails, AccordionSummary, Box, Button, CircularProgress, TextField} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {useIntl} from "react-intl";
import debounce from "lodash.debounce";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {Organisation, OrganisationResource} from "../../types";
import EditLocations from "../edit-locations";
import useApiClient from "../../hooks/useApiClient";

interface EditOrganisationProps {
  id: string;
  initialState?: Organisation;
  initialOpen?: boolean;
  onRemove?: () => void | Promise<void>;
}

const EditOrganisation: FC<EditOrganisationProps> = ({ id, initialState, initialOpen = true, onRemove }) => {
  const intl = useIntl();
  const api = useApiClient<'organisations'>('organisations');
  const [isExpanded, setIsExpanded] = useState(initialOpen);
  const [organisation, setOrganisation] = useState<Organisation>(initialState);

  const debouncedUpdate = debounce((data: OrganisationResource) => {
    api.update(data).then(() => api.one(data.id)).then(d => setOrganisation(d));
  }, 2000);

  useEffect(() => {
    if (!initialState) {
      api.one(id).then(o => setOrganisation(o))
    }
  }, [id, initialState]);

  if (!organisation) return <CircularProgress />;

  return (
    <Accordion expanded={isExpanded} onChange={(_, ex) => setIsExpanded(ex)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        {organisation.name}
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', py: 1 }}>
          <Box sx={{ flexGrow: 1, px: 1 }}>
            <TextField
              label={intl.formatMessage({ id: 'input.organisation.name' })}
              variant="standard"
              defaultValue={organisation.name}
              fullWidth
              onChange={(e) => debouncedUpdate({
                id: organisation.id,
                description: organisation.description,
                name: e.target.value,
              })}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  debouncedUpdate({
                    id: organisation.id,
                    description: organisation.description,
                    // @ts-ignore
                    name: e.target.value,
                  });
                }
              }}
            />
            <TextField
              label={intl.formatMessage({ id: 'input.organisation.description' })}
              variant="standard"
              defaultValue={organisation.description}
              fullWidth
              multiline
              onChange={(e) => debouncedUpdate({
                id: organisation.id,
                name: organisation.name,
                description: e.target.value
              })}
            />
          </Box>
          <Box>
            <Button
              variant="contained"
              onClick={() => {
                if (typeof window !== 'undefined' && !window.confirm(intl.formatMessage({ id: 'dialog.confirm.delete' }))) return;

                api.remove(organisation).then(() => onRemove && onRemove());
              }}
            >
              <DeleteIcon />
            </Button>
          </Box>
        </Box>
        {isExpanded && (
          <EditLocations
            organisationId={organisation.id}
            initialOpen={false}
            initialState={organisation.locations}
          />
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default EditOrganisation;
