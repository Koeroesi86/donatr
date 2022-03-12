import React, {FC, useEffect, useState} from 'react';
import {LatLngExpression} from "leaflet";
import {Link, List, ListItemButton, ListItemIcon, ListItemText, Theme, Typography} from "@mui/material";
import {createStyles, makeStyles} from '@mui/styles';
import {Location, LocationsFilters} from "../../types";
import {ApiClient} from "../../utils";
import {Link as RLink} from "react-router-dom";
import {FormattedMessage} from "react-intl";
import MapBlock from "../map-block";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocationListItem from "../location-list-item";

const useStyles = makeStyles((theme: Theme) => createStyles({
  map: {
    height: '400px',
    width: '100%',
    minWidth: '200px',
    boxSizing: 'border-box',
  },
}));

// @ts-ignore
const api = new ApiClient<Location, 'needs', LocationsFilters>('locations');

const byName = (a: Location, b: Location) => a.name.localeCompare(b.name);

const LocationsRoute: FC = () => {
  const styles = useStyles();
  const [locations, setLocations] = useState<Location[]>([]);
  const [center] = useState<LatLngExpression>({
    lat: 47.497913,
    lng: 19.040236,
  });

  useEffect(() => {
    api.all().then((l) => setLocations(l.sort(byName))).catch(console.error);
  }, []);

  if (!locations.length) return null;

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
          <LocationListItem key={`location-list-item-${loc.id}`} location={loc} />
        ))}
      </List>
    </>
  )
};

export default LocationsRoute;
