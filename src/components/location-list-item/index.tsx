import React, {FC} from "react";
import {Link as RLink} from "react-router-dom";
import {Badge, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NotListedLocationIcon from '@mui/icons-material/NotListedLocation';
import {LocationResource, Need} from "../../types";

interface LocationListItemProps {
  location: LocationResource;
  needs: Need[];
}

const LocationListItem: FC<LocationListItemProps> = ({ location, needs }) => {
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
