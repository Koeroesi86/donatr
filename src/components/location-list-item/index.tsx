import React, {FC, useMemo} from "react";
import {Link as RLink} from "react-router-dom";
import {Badge, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NotListedLocationIcon from '@mui/icons-material/NotListedLocation';
import {LocationResource, NeedsFilters} from "../../types";
import useNeeds from "../../hooks/useNeeds";

interface LocationListItemProps {
  location: LocationResource;
}

const LocationListItem: FC<LocationListItemProps> = ({ location }) => {
  const filter = useMemo<NeedsFilters>(() => ({
    locationId: location.id,
  }),[location]);
  const needs = useNeeds(filter);
  const icon = location.location ? <LocationOnIcon /> : <NotListedLocationIcon />;
  return (
    <ListItemButton component={RLink} to={`/locations/${location.id}`}>
      <ListItemIcon>
        {needs.length ? (
          <Badge badgeContent={needs.length} color="primary">
            {icon}
          </Badge>
        ) : (
          icon
        )}
      </ListItemIcon>
      <ListItemText primary={location.name} />
    </ListItemButton>
  )
}

export default LocationListItem;
