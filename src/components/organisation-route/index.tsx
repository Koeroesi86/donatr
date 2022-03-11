import React, {FC, useEffect, useState} from "react";
import {ApiClient} from "../../utils";
import {Organisation} from "../../types";
import {Link as RLink, useParams} from "react-router-dom";
import {createStyles, makeStyles} from "@mui/styles";
import {Link, List, ListItemButton, ListItemIcon, ListItemText, Theme, Typography} from "@mui/material";
import MapBlock from "../map-block";
import {LatLngExpression} from "leaflet";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const api = new ApiClient<Organisation>('organisations');

const useStyles = makeStyles((theme: Theme) => createStyles({
  map: {
    height: '400px',
    width: '100%',
    minWidth: '200px',
    boxSizing: 'border-box',
  },
}));

const OrganisationRoute: FC = () => {
  const params = useParams();
  const styles = useStyles();
  const [organisation, setOrganisation] = useState<Organisation>();
  const [center] = useState<LatLngExpression>({
    lat: 47.497913,
    lng: 19.040236,
  });

  useEffect(() => {
    api.one(params.organisationId).then(setOrganisation).catch(console.error);
  }, [params]);

  if (!organisation) return null;

  const locationsWithGeo = organisation.locations.filter((l) => l.location);

  return (
    <>
      <Typography variant="h2" sx={{ my: 2 }}>
        {organisation.name}
      </Typography>
      <MapBlock
        center={center}
        zoom={6}
        className={styles.map}
        markers={locationsWithGeo.map((loc) => ({
          lat: loc.location.lat,
          lng: loc.location.lng,
          popup: (
            <>
              <Link
                to={`/locations/${loc.id}`}
                component={RLink}
                color="inherit"
                sx={{ display: 'block' }}
              >
                {loc.location.text}
              </Link>
              <Link
                href={`https://maps.google.com/maps?q=${loc.location.lat},${loc.location.lng}`}
                target="_blank"
                color="inherit"
                sx={{ display: 'block' }}
              >
                Google
              </Link>
            </>
          ),
        }))}
      />
      <List>
        {organisation.locations.map((loc) => (
          <ListItemButton component={RLink} to={`/locations/${loc.id}`}>
            <ListItemIcon>
              <LocationOnIcon />
            </ListItemIcon>
            <ListItemText primary={loc.name} />
          </ListItemButton>
        ))}
      </List>
    </>
  );
}

export default OrganisationRoute;
