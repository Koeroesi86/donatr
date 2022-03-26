import React, {FC, useCallback, useEffect, useState} from "react";
import debounce from "lodash.debounce";
import {
  Container,
  IconButton,
  InputAdornment,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Theme
} from "@mui/material";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import {Link as RLink, useSearchParams} from "react-router-dom";
import {FormattedMessage, useIntl} from "react-intl";
import {createStyles, makeStyles} from "@mui/styles";
import {LatLngExpression} from "leaflet";
import ClearIcon from '@mui/icons-material/Clear';
import {LocationResource, NeedResource} from "../../types";
import {sortByNames} from "../../utils";
import MapBlock from "../map-block";
import useApiClient from "../../hooks/useApiClient";

const useStyles = makeStyles((theme: Theme) => createStyles({
  map: {
    height: '400px',
    width: '100%',
    minWidth: '200px',
    boxSizing: 'border-box',
  },
}));

const Needs: FC = () => {
  const intl = useIntl();
  const api = useApiClient<'needs'>('needs');
  const apiLocations = useApiClient<'locations'>('locations');
  const [searchParams, setSearchParams] = useSearchParams();
  const [term, setTerm] = useState<string>(
    searchParams.has('s')
      ? searchParams.get('s')
      : ''
  );
  const search = useCallback(debounce((search: string) => {
    if (searchParams.get('s') !== search) {
      setSearchParams(search ? { s: search } : {});
    }
    api.all({ search })
      .then((data) => data.sort(sortByNames))
      .then((data) => {
        setListing(data);
        if (search) {
          const locationIds = Array.from(new Set(data.map((n) => n.locationId)));
          Promise.all(locationIds.map((id) => apiLocations.one(id)))
            .then((locations) => locations.filter((l) => l.location))
            .then(setLocations)
            .catch(console.error);
        } else {
          setLocations([]);
        }
      })
      .catch(console.error);
  }, 200), []);
  const [listing, setListing] = useState<NeedResource[]>([]);
  const [locations, setLocations] = useState<LocationResource[]>([]);
  const styles = useStyles();
  const [center] = useState<LatLngExpression>({
    lat: 47.497913,
    lng: 19.040236,
  });

  useEffect(() => {
    search(term);
  }, [term, search]);

  return (
    <Container maxWidth="lg">
      <TextField
        label={intl.formatMessage({ id: 'input.needs.search.label' })}
        value={term}
        variant="standard"
        onChange={(e) => setTerm(e.target.value)}
        sx={{ my: 2 }}
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
              aria-label="toggle password visibility"
              onClick={() => setTerm('')}
              onMouseDown={() => setTerm('')}
              edge="end"
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          )
        }}
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
    </Container>
  )
}

export default Needs;
