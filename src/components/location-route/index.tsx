import React, {FC, useEffect, useState} from "react";
import {Link as RLink, useParams} from "react-router-dom";
import {FormattedMessage} from "react-intl";
import {
  Breadcrumbs,
  Card,
  CardContent,
  CircularProgress,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Theme,
  Typography
} from "@mui/material";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import {LocationResource, OrganisationResource} from "../../types";
import MapBlock from "../map-block";
import {createStyles, makeStyles} from "@mui/styles";
import useApiClient from "../../hooks/useApiClient";
import useNeeds from "../../hooks/useNeeds";

const useStyles = makeStyles((theme: Theme) => createStyles({
  map: {
    height: '400px',
    width: '100%',
    minWidth: '200px',
    boxSizing: 'border-box',
  },
}));

const LocationRouteBreadCrumb: FC<{ location: LocationResource }> = ({ location }) => {
  const apiOrganisation = useApiClient<'organisations'>('organisations');
  const [organisation, setOrganisation] = useState<OrganisationResource>();

  useEffect(() => {
    apiOrganisation.one(location.organisationId).then(setOrganisation).catch(console.error);
  }, [apiOrganisation, location]);

  if (!organisation) {
    return <CircularProgress />;
  }

  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mt: 2 }}>
      <Link to={`/organisations/${organisation.id}`} component={RLink} color="inherit">
        {organisation.name}
      </Link>
      <Link to={`/locations/${location.id}`} component={RLink} color="inherit">
        {location.name}
      </Link>
    </Breadcrumbs>
  );
}

const LocationRoute: FC = () => {
  const params = useParams();
  const styles = useStyles();
  const api = useApiClient<'locations'>('locations')
  const [location, setLocation] = useState<LocationResource>();
  const needs = useNeeds(({ locationId: params.locationId }));

  useEffect(() => {
    api.one(params.locationId).then(setLocation).catch(console.error);
  }, [api, params]);

  if (!location) {
    return <CircularProgress />;
  }

  return (
    <>
      <LocationRouteBreadCrumb location={location} />
      <Typography variant="h3" sx={{ my: 2 }}>
        {location.name}
      </Typography>
      {location.location && (
        <MapBlock
          center={{ lat: location.location.lat, lng: location.location.lng }}
          className={styles.map}
          zoom={12}
          markers={[{
            lat: location.location.lat,
            lng: location.location.lng,
            popup: <>
              {location.location.text}
              <Link
                href={`https://maps.google.com/maps?q=${location.location.lat},${location.location.lng}`}
                target="_blank"
                sx={{ display: 'block' }}
              >
                Google
              </Link>
            </>,
          }]}
        />
      )}
      {needs.length > 0 && (
        <Card sx={{ my: 2 }}>
          <CardContent>
            <Typography variant="h5">
              <FormattedMessage id="page.needs" />
            </Typography>
            <List>
              {needs.map((need) => (
                <ListItem key={`location-${location.id}-need-${need.id}`}>
                  <ListItemIcon>
                    <ShoppingBagIcon />
                  </ListItemIcon>
                  <ListItemText primary={need.name} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </>
  )
}

export default LocationRoute;
