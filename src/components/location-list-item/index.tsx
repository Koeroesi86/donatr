import React, {FC} from "react";
import {Link as RLink} from "react-router-dom";
import {Badge, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {LocationResource} from "../../types";
import useNeeds from "../../hooks/useNeeds";

interface LocationListItemProps {
  location: LocationResource;
}

const LocationListItem: FC<LocationListItemProps> = ({ location }) => {
  const needs = useNeeds({ locationId: location.id });
  return (
    <ListItemButton component={RLink} to={`/locations/${location.id}`}>
      <ListItemIcon>
        {needs.length ? (
          <Badge badgeContent={needs.length} color="primary">
            <LocationOnIcon />
          </Badge>
        ) : (
          <LocationOnIcon />
        )}
      </ListItemIcon>
      <ListItemText primary={location.name} />
    </ListItemButton>
  )
}

export default LocationListItem;
