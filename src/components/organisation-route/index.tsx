import React, {FC, useEffect, useMemo, useState} from "react";
import {Link as RLink, useParams} from "react-router-dom";
import {CircularProgress, Container, Link, List, Typography} from "@mui/material";
import {LatLngExpression} from "leaflet";
import {hasGeoLocation} from "../../utils";
import {SizedMapBlock} from "../map-block";
import LocationListItem from "../location-list-item";
import useApiClient from "../../hooks/useApiClient";
import useLocations from "../../hooks/useLocations";
import useNeeds from "../../hooks/useNeeds";
import OrganisationDescription from "../organisation-description";
import {useAppDispatch, useAppSelector} from "../../redux";
import organisationsReducer from "../../redux/organisationsReducer";
import {getOrganisation} from "../../redux/selectors";

const OrganisationRoute: FC = () => {
  const { organisationId = '' } = useParams();
  const api = useApiClient<'organisations'>('organisations');
  const organisation = useAppSelector(getOrganisation(organisationId));
  const dispatch = useAppDispatch();
  const [center] = useState<LatLngExpression>({
    lat: 47.497913,
    lng: 19.040236,
  });
  const filter = useMemo(() => ({ organisationId: organisationId }), [organisationId]);
  const locations = useLocations(filter);
  const needs = useNeeds();

  useEffect(() => {
    if (!organisation) {
      api.one(organisationId)
        .then((o) => dispatch(organisationsReducer.actions.setOrganisation(o)))
        .catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organisationId]);

  if (!organisation) return <CircularProgress />;

  const locationsWithGeo = locations.filter(hasGeoLocation);

  return (
    <Container maxWidth="lg">
      <Typography variant="h3" sx={{ my: 2 }}>
        {organisation.name}
      </Typography>
      <SizedMapBlock
        center={center}
        zoom={6}
        markers={locationsWithGeo.map((loc) => ({
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
      {organisation.description && (
        <OrganisationDescription description={organisation.description} />
      )}
      <List>
        {locations.map((loc) => (
          <LocationListItem
            key={`location-list-item-${loc.id}`}
            location={loc}
            needs={needs.filter((n) => n.locationId === loc.id)}
          />
        ))}
      </List>
    </Container>
  );
};

export default OrganisationRoute;
