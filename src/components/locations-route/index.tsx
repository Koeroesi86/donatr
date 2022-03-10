import React, {FC, useEffect, useState} from 'react';
import {MapContainer, TileLayer, Marker, Popup} from 'react-leaflet';
import {LatLngExpression} from "leaflet";
import {Link, List, ListItemButton, ListItemText, Theme, Typography} from "@mui/material";
import {createStyles, makeStyles} from '@mui/styles';
import {Location, LocationsFilters} from "../../types";
import {ApiClient} from "../../utils";
import {Link as RLink} from "react-router-dom";
import {FormattedMessage} from "react-intl";

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
      <Typography variant="h2" sx={{ my: 2 }}>
        <FormattedMessage id="page.locations" />
      </Typography>
      <MapContainer center={center} zoom={6} className={styles.map}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locationsWithGeo.length > 0 && locationsWithGeo.map((loc) => (
          <Marker position={{ lat: loc.location.lat, lng: loc.location.lng }} key={`marker-${loc.id}`}>
            <Popup>
              <Link to={`/locations/${loc.id}`} component={RLink} color="inherit">
                {loc.location.text}
              </Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <List>
        {locations.map((loc) => (
          <ListItemButton>
            <ListItemText primary={loc.name} />
          </ListItemButton>
        ))}
      </List>
    </>
  )
};

export default LocationsRoute;
