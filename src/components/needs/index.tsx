import React, {FC, useEffect, useMemo, useRef, useState} from "react";
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
  TextField
} from "@mui/material";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import {Link as RLink, useSearchParams} from "react-router-dom";
import {FormattedMessage, useIntl} from "react-intl";
import {LatLngExpression} from "leaflet";
import ClearIcon from '@mui/icons-material/Clear';
import {GeoLocationResource, NeedResource} from "../../types";
import {hasGeoLocation, sortByNames} from "../../utils";
import {SizedMapBlock} from "../map-block";
import useApiClient from "../../hooks/useApiClient";

const Needs: FC = () => {
  const intl = useIntl();
  const api = useApiClient<'needs'>('needs');
  const apiLocations = useApiClient<'locations'>('locations');
  const [searchParams, setSearchParams] = useSearchParams();
  const [term, setTerm] = useState<string>(
    searchParams.get('s') ?? ''
  );
  const routerRef = useRef({ searchParams, setSearchParams });
  useEffect(() => {
    routerRef.current = { searchParams, setSearchParams };
  });
  const search = useMemo(() => debounce((search: string) => {
    const { searchParams: currentParams, setSearchParams: setCurrentParams } = routerRef.current;
    if (currentParams.get('s') !== search) {
      setCurrentParams(search ? { s: search } : {});
    }
    api.all({ search })
      .then((data) => data.sort(sortByNames))
      .then((data) => {
        setListing(data);
        if (search) {
          const locationIds = Array.from(new Set(data.map((n) => n.locationId)));
          Promise.all(locationIds.map((id) => apiLocations.one(id)))
            .then((locations) => locations.filter(hasGeoLocation))
            .then(setLocations)
            .catch(console.error);
        } else {
          setLocations([]);
        }
      })
      .catch(console.error);
  }, 200), [api, apiLocations]);
  const [listing, setListing] = useState<NeedResource[]>([]);
  const [locations, setLocations] = useState<GeoLocationResource[]>([]);
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
        slotProps={{ input: {
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
        } }}
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
        <SizedMapBlock
          center={center}
          zoom={6}
          markers={locations.map((loc) => ({
            lat: loc.location.lat,
            lng: loc.location.lng,
            key: `${loc.id}-marker`,
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
