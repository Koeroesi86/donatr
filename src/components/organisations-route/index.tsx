import React, {FC, useEffect, useState} from "react";
import {Organisation} from "../../types";
import {
  CircularProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from "@mui/material";
import {FormattedMessage, useIntl} from "react-intl";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import {Link} from "react-router-dom";
import {sortByNames} from "../../utils";
import useApiClient from "../../hooks/useApiClient";

const OrganisationsRoute: FC = () => {
  const intl = useIntl();
  const api = useApiClient<'organisations'>('organisations');
  const [organisations, setOrganisations] = useState<Organisation[]>([])
  useEffect(() => {
    api.all()
      .then((data) => data.sort(sortByNames))
      .then((data) => setOrganisations(data))
      .catch(console.error);
  }, [api]);
  return (
    <>
      <Typography variant="h3" sx={{ my: 2 }}>
        <FormattedMessage id="page.organisations" />
      </Typography>
      <List>
        {organisations.length === 0 && (
          <CircularProgress />
        )}
        {organisations.map(organisation => (
          <ListItemButton
            key={`organisation-${organisation.id}`}
            to={`/organisations/${organisation.id}`}
            component={Link}
          >
            <ListItemIcon>
              <CorporateFareIcon />
            </ListItemIcon>
            <ListItemText
              primary={organisation.name}
              secondary={intl.formatMessage(
                { id: 'page.organisations.locations.count' },
                { count: organisation.locations.length }
              )}
            />
          </ListItemButton>
        ))}
      </List>
    </>
  )
}

export default OrganisationsRoute;