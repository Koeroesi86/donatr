import React, {FC, useEffect, useState} from "react";
import axios from "axios";
import {Organisation} from "../../types";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import {FormattedMessage} from "react-intl";
import {ApiClient} from "../../utils";

const api = new ApiClient<Organisation, 'locations'>('organisations');

const Organisations: FC = () => {
  const [organisations, setOrganisations] = useState<Organisation[]>([])
  useEffect(() => {
    api.all()
      .then((data) => data.sort((a, b) => a.name.localeCompare(b.name)))
      .then((data) => setOrganisations(data))
      .catch(console.error);
  }, [])
  return (
    <>
      <Typography variant="h2" sx={{ my: 2 }}>
        <FormattedMessage id="page.organisations" />
      </Typography>
      {organisations.map(organisation => (
        <Accordion key={`organisation-${organisation.id}`}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            {organisation.name}
          </AccordionSummary>
          <AccordionDetails>
            {organisation.locations.map(l => (
              <Accordion key={`organisation-${organisation.id}-location-${l.id}`}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>{l.name}</AccordionSummary>
                <AccordionDetails>
                  <List>
                    {l.needs.map(need => (
                      <ListItem key={`organisation-${organisation.id}-location-${l.id}-need ${need.id}`}>
                        <ListItemIcon>
                          <ShoppingBagIcon />
                        </ListItemIcon>
                        <ListItemText primary={need.name} />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  )
}

export default Organisations;