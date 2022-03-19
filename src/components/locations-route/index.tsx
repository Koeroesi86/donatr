import React, {FC, useState} from 'react';
import {LatLngExpression} from "leaflet";
import {CircularProgress, Link, List, Theme, Typography} from "@mui/material";
import {createStyles, makeStyles} from '@mui/styles';
import {Link as RLink} from "react-router-dom";
import {FormattedMessage} from "react-intl";
import MapBlock from "../map-block";
import LocationListItem from "../location-list-item";
import useLocations from "../../hooks/useLocations";
import useNeeds from "../../hooks/useNeeds";

const useStyles = makeStyles((theme: Theme) => createStyles({
  map: {
    height: '400px',
    width: '100%',
    minWidth: '200px',
    boxSizing: 'border-box',
  },
}));

const LocationsRoute: FC = () => {
  const styles = useStyles();
  const locations = useLocations();
  const needs = useNeeds();
  const [center] = useState<LatLngExpression>({
    lat: 47.497913,
    lng: 19.040236,
  });

  if (!locations.length) return <CircularProgress />;

  const locationsWithGeo = locations.filter((l) => l.location);

  return (
    <>
      <Typography variant="h3" sx={{ my: 2 }}>
        <FormattedMessage id="page.locations" />
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
        {locations.map((loc) => (
          <LocationListItem
            key={`location-list-item-${loc.id}`}
            location={loc}
            needs={needs.filter((n) => n.locationId === loc.id)}
          />
        ))}
      </List>
    </>
  );
};

export default LocationsRoute;
