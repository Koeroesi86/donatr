import React, {FC, useEffect, useState} from "react";
import {Accordion, AccordionDetails, AccordionSummary, List, ListItem, ListItemIcon, ListItemText} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import {Location as LocationType} from "../../types";
import axios from "axios";

interface LocationProps {
  id: string;
  open?: boolean;
}

const Location: FC<LocationProps> = ({ id, open = false }) => {
  const [loc, setLoc] = useState<LocationType>();

  useEffect(() => {
    axios.get(`/api/locations/${id}`).then(({ data }) => setLoc(data)).catch(console.error);
  }, [id]);

  if (!loc) return null;

  return (
    <Accordion defaultExpanded={open}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>{loc.name}</AccordionSummary>
      <AccordionDetails>
        <List>
          {loc.needs.map(need => (
            <ListItem key={need.id}>
              <ListItemIcon>
                <ShoppingBagIcon />
              </ListItemIcon>
              <ListItemText primary={need.name} />
            </ListItem>
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  )
};

export default Location;