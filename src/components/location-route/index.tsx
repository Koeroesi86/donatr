import React, {FC, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {FormattedMessage} from "react-intl";
import {
  Card,
  CardContent,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Theme,
  Typography
} from "@mui/material";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import {ApiClient} from "../../utils";
import {Location, LocationsFilters} from "../../types";
import MapBlock from "../map-block";
import {createStyles, makeStyles} from "@mui/styles";

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

const LocationRoute: FC = () => {
  const params = useParams();
  const styles = useStyles();
  const [location, setLocation] = useState<Location>();

  useEffect(() => {
    api.one(params.locationId).then(setLocation).catch(console.error);
  }, [params]);

  if (!location) return null;

  return (
    <>
      <Typography variant="h2" sx={{ my: 2 }}>
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
      <Card sx={{ my: 2 }}>
        <CardContent>
          <Typography variant="h5">
            <FormattedMessage id="page.needs" />
          </Typography>
          <List>
            {location.needs.map((need) => (
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
    </>
  )
}

export default LocationRoute;
