import React, {FC, useEffect, useState} from "react";
import {Organisation} from "../../types";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from "@mui/material";
import {FormattedMessage, useIntl} from "react-intl";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import {Link} from "react-router-dom";
import {ApiClient, sortByNames} from "../../utils";

const api = new ApiClient<Organisation, 'locations'>('organisations');

const OrganisationsRoute: FC = () => {
  const intl = useIntl();
  const [organisations, setOrganisations] = useState<Organisation[]>([])
  useEffect(() => {
    api.all()
      .then((data) => data.sort(sortByNames))
      .then((data) => setOrganisations(data))
      .catch(console.error);
  }, [])
  return (
    <>
      <Typography variant="h3" sx={{ my: 2 }}>
        <FormattedMessage id="page.organisations" />
      </Typography>
      <List>
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