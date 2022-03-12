import React, {FC, useEffect, useState} from "react";
import {Link as RLink, useParams} from "react-router-dom";
import {createStyles, makeStyles} from "@mui/styles";
import {Link, List, Theme, Typography} from "@mui/material";
import {LatLngExpression} from "leaflet";
import ReactMarkdown from "react-markdown";
import RemarkBreaks from "remark-breaks";
import RemarkGfm from "remark-gfm";
import {ApiClient, sortByNames} from "../../utils";
import {Organisation} from "../../types";
import MapBlock from "../map-block";
import LocationListItem from "../location-list-item";

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
      <Typography variant="h3" sx={{ my: 2 }}>
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
      {organisation.description && (
        <ReactMarkdown
          linkTarget="_blank"
          skipHtml
          unwrapDisallowed
          children={organisation.description}
          remarkPlugins={[RemarkBreaks, RemarkGfm]}
        />
      )}
      <List>
        {organisation.locations.sort(sortByNames).map((loc) => (
          <LocationListItem key={`location-list-item-${loc.id}`} location={loc} />
        ))}
      </List>
    </>
  );
}

export default OrganisationRoute;
