import React, {FC, useCallback, useEffect, useState} from "react";
import debounce from "lodash.debounce";
import {Location, Need} from "../../types";
import {Link, List, ListItem, ListItemIcon, ListItemText, TextField, Theme} from "@mui/material";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import {Link as RLink} from "react-router-dom";
import {FormattedMessage, useIntl} from "react-intl";
import {ApiClient, sortByNames} from "../../utils";
import MapBlock from "../map-block";
import {createStyles, makeStyles} from "@mui/styles";
import {LatLngExpression} from "leaflet";

const useStyles = makeStyles((theme: Theme) => createStyles({
  map: {
    height: '400px',
    width: '100%',
    minWidth: '200px',
    boxSizing: 'border-box',
  },
}));

const api = new ApiClient<Need, undefined, { s: string }>('needs');
const apiLocations = new ApiClient<Location>('locations');

const Needs: FC = () => {
  const intl = useIntl();
  const [term, setTerm] = useState<string>('');
  const search = useCallback(debounce((s: string) => {
    setTerm(s);
  }, 200), []);
  const [listing, setListing] = useState<Need[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const styles = useStyles();
  const [center] = useState<LatLngExpression>({
    lat: 47.497913,
    lng: 19.040236,
  });

  useEffect(() => {
    api.all({ s: term })
      .then((data) => data.sort(sortByNames))
      .then((data) => setListing(data))
      .catch(console.error);
  }, [term]);

  useEffect(() => {
    if (term) {
      const locationIds = Array.from(new Set(listing.map((n) => n.locationId)));
      Promise.all(locationIds.map((id) => apiLocations.one(id)))
        .then((locations) => locations.filter((l) => l.location))
        .then(setLocations)
        .catch(console.error);
    } else {
      setLocations([]);
    }
  }, [listing, term])

  return (
    <>
      <TextField
        label={intl.formatMessage({ id: 'input.needs.search.label' })}
        variant="standard"
        onChange={(e) => search(e.target.value)}
        fullWidth
        sx={{ my: 2 }}
      />
      <List sx={{ maxHeight: 400, overflow: 'auto', mb: 2 }}>
        {listing.map(need => (
          <ListItem key={`need-${need.id}`}>
            <ListItemIcon>
              <ShoppingBagIcon />
            </ListItemIcon>
            <ListItemText primary={need.name} />
            <Link to={`/locations/${need.locationId}`} component={RLink} color="inherit">
              <FormattedMessage id="page.needs.location.link" />
            </Link>
          </ListItem>
        ))}
      </List>
      {locations.length > 0 && (
        <MapBlock
          center={center}
          zoom={6}
          className={styles.map}
          markers={locations.map((loc) => ({
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
      )}
    </>
  )
}

export default Needs;
