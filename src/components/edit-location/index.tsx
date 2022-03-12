import React, {FC, useCallback, useEffect, useState} from "react";
import {Accordion, AccordionDetails, AccordionSummary, Box, Button, Modal, TextField} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditNeeds from "../edit-needs";
import {Location, LocationResource, LocationsFilters} from "../../types";
import {FormattedMessage, useIntl} from "react-intl";
import debounce from "lodash.debounce";
import {ApiClient} from "../../utils";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LocationPicker from "../location-picker";

interface EditLocationProps {
  id: string;
  initialState?: LocationResource;
  initialOpen?: boolean;
  onRemove?: () => void | Promise<void>;
}

// @ts-ignore
const api = new ApiClient<Location, 'needs', LocationsFilters>('locations');

const EditLocation: FC<EditLocationProps> = ({ id, initialState, initialOpen = true, onRemove }) => {
  const intl = useIntl();
  const [isExpanded, setIsExpanded] = useState(initialOpen);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [location, setLocation] = useState<LocationResource>(initialState);
  const debouncedUpdate = debounce((data: LocationResource) => {
    api.update(data).then(() => refresh());
  }, 2000);

  const refresh = useCallback(() => {
    api.one(id).then((l) => setLocation(l));
  }, [id]);

  useEffect(() => {
    if (!initialState) refresh();
  }, [refresh, initialState]);

  if (!location) {
    return null;
  }

  return (
    <Accordion key={`edit-location-${location.id}`} expanded={isExpanded} onChange={(_, ex) => setIsExpanded(ex)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        {location.name}
      </AccordionSummary>
      <AccordionDetails>
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
                location: location.location,
                name: e.target.value,
              })}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  debouncedUpdate({
                    id: location.id,
                    organisationId: location.organisationId,
                    location: location.location,
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

                api.remove(location).then(() => onRemove && onRemove());
              }}
            >
              <DeleteIcon />
            </Button>
          </Box>
        </Box>
        <Box>
          <Button onClick={() => setIsLocationOpen(true)}>
            {location.location ? (
              <small>{location.location.text}</small>
            ) : (
              <FormattedMessage id="input.location.pick.location.label" />
            )}
          </Button>
        </Box>
        <Modal open={isLocationOpen} onClose={() => setIsLocationOpen(false)}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'background.paper',
              border: '2px solid #000',
              boxShadow: 24,
              p: 4,
            }}
          >
            <LocationPicker
              picked={location.location}
              onSave={(picked) => {
                api.update({ ...location, location: picked }).then(() => {
                  refresh();
                  setIsLocationOpen(false);
                });
              }}
            />
          </Box>
        </Modal>
        {isExpanded && (
          <EditNeeds locationId={location.id} />
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default EditLocation;
