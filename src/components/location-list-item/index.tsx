import React, {FC, useEffect} from "react";
import {Link as RLink} from "react-router-dom";
import {Badge, CircularProgress, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NotListedLocationIcon from '@mui/icons-material/NotListedLocation';
import {LocationResource, Need} from "../../types";
import {useAppDispatch, useAppSelector} from "../../redux";
import {getOrganisation} from "../../redux/selectors";
import organisationsReducer from "../../redux/organisationsReducer";
import useApiClient from "../../hooks/useApiClient";

interface LocationListItemProps {
  location: LocationResource;
  needs: Need[];
}

const LocationListItem: FC<LocationListItemProps> = ({ location, needs }) => {
  const organisation = useAppSelector(getOrganisation(location.organisationId));

  if (!organisation) {
    return null;
  }

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
      <ListItemText primary={location.name} secondary={organisation.name} />
    </ListItemButton>
  )
}

export default LocationListItem;
