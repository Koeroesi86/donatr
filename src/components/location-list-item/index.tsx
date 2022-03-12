import React, {FC} from "react";
import {Link as RLink} from "react-router-dom";
import {Badge, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {Location} from "../../types";

interface LocationListItemProps {
  location: Location;
}

const LocationListItem: FC<LocationListItemProps> = ({ location }) => {
  return (
    <ListItemButton component={RLink} to={`/locations/${location.id}`}>
      <ListItemIcon>
        {location.needs.length ? (
          <Badge badgeContent={location.needs.length} color="primary">
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
