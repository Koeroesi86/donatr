import React, {FC} from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardHeader,
  CircularProgress,
  Container,
  Link,
  Typography
} from "@mui/material";
import {FormattedMessage, useIntl} from "react-intl";
import {Link as RLink} from "react-router-dom";
import useOrganisations from "../../hooks/useOrganisations";
import useLocations from "../../hooks/useLocations";

const capitalLetters = (value: string) =>
  value
    .split('')
    .filter((a) => a.toUpperCase() === a && a.trim() === a)
    .join('')

const OrganisationsRoute: FC = () => {
  const intl = useIntl();
  const organisations = useOrganisations();
  const locations = useLocations();
  return (
    <Container maxWidth="lg">
      <Typography variant="h3" sx={{ my: 2 }}>
        <FormattedMessage id="page.organisations" />
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-evenly' }}>
        {organisations.length === 0 && (
          <CircularProgress />
        )}
        {organisations.map(organisation => (
          <Card
            key={`organisation-${organisation.id}`}
            sx={{
              maxWidth: 345,
              my: 2,
              display: 'flex',
              flexDirection: 'column',
              width: { xs: '100%', sm: '100%', md: '50%', lg: '33%', xl: '33%' },
            }}
          >
            <CardHeader
              title={<Link component={RLink} to={`/organisations/${organisation.id}`}>{organisation.name}</Link>}
              subheader={intl.formatMessage(
                { id: 'page.organisations.locations.count' },
                { count: locations.filter((l) => l.organisationId === organisation.id).length }
              )}
              avatar={<Avatar>{capitalLetters(organisation.name).substring(0, 2)}</Avatar>}
            />
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button component={RLink} to={`/organisations/${organisation.id}`}>
                <FormattedMessage id="page.organisations.more" />
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Container>
  )
}

export default OrganisationsRoute;