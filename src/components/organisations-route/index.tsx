import React, {FC} from "react";
import {
  CircularProgress,
  Container,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from "@mui/material";
import {FormattedMessage, useIntl} from "react-intl";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import {Link} from "react-router-dom";
import useOrganisations from "../../hooks/useOrganisations";
import useLocations from "../../hooks/useLocations";

const OrganisationsRoute: FC = () => {
  const intl = useIntl();
  const organisations = useOrganisations();
  const locations = useLocations();
  return (
    <Container maxWidth="lg">
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
                { count: locations.filter((l) => l.organisationId === organisation.id).length }
              )}
            />
          </ListItemButton>
        ))}
      </List>
    </Container>
  )
}

export default OrganisationsRoute;