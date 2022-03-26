import React, {FC} from "react";
import {FormattedMessage, useIntl} from "react-intl";
import {Box, Card, CardContent, CardMedia, Container, Typography, useTheme} from "@mui/material";
import {alpha} from '@mui/material/styles';

const align: 'left' | 'center' | 'right' = 'center';

const Home: FC = () => {
  const theme = useTheme();
  const intl = useIntl();
  return (
    <>
      <Box sx={{
        background: 'url(/static/images/site_cover.jpg) center center no-repeat',
        backgroundSize: 'cover',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: { xs: 300, sm: 400, md: 400, lg: 600, xl: 600 },
        boxShadow: 1,
      }}>
        <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Card sx={{
            backgroundColor: alpha(theme.palette.background.default, 0.4),
            backdropFilter: 'blur(2px)',
          }}>
            <CardContent>
              <Typography variant="h2" sx={{ my: 2 }} align={align}>
                <FormattedMessage id="site.name" />
              </Typography>
              <Typography variant="body1" align={align}>
                <FormattedMessage id="page.home.intro" />
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>
      <Container maxWidth="lg">
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-evenly',
          flexWrap: 'wrap',
          mt: 2,
        }}>
          <Card sx={{ maxWidth: 345, my: 2, minHeight: 370 }}>
            <CardMedia
              component="img"
              image="/static/images/needs_thumbnail.jpg"
              alt={intl.formatMessage({ id: 'page.home.user.title.needs' })}
              sx={{ minHeight: 190 }}
            />
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>
                <FormattedMessage id="page.home.user.title.needs" />
              </Typography>
              <Typography variant="body2">
                <FormattedMessage id="page.home.user.intro.needs" />
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ maxWidth: 345, my: 2, minHeight: 370 }}>
            <CardMedia
              component="img"
              image="/static/images/locations_thumbnail.jpg"
              alt={intl.formatMessage({ id: 'page.home.user.title.locations' })}
              sx={{ minHeight: 190 }}
            />
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>
                <FormattedMessage id="page.home.user.title.locations" />
              </Typography>
              <Typography variant="body2">
                <FormattedMessage id="page.home.user.intro.locations" />
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ maxWidth: 345, my: 2, minHeight: 370 }}>
            <CardMedia
              component="img"
              image="/static/images/organisations_thumbnail.jpg"
              alt={intl.formatMessage({ id: 'page.home.user.title.organisations' })}
              sx={{ minHeight: 190 }}
            />
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>
                <FormattedMessage id="page.home.user.title.organisations" />
              </Typography>
              <Typography variant="body2">
                <FormattedMessage id="page.home.user.intro.organisations" />
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Typography variant="h2" sx={{ mt: 4 }} align={align}>
          <FormattedMessage id="page.home.edit.title" />
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }} align={align}>
          <FormattedMessage id="page.home.edit.intro" />
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-evenly', flexWrap: 'wrap' }}>
          <Card sx={{ maxWidth: 345, my: 2 }}>
            <CardMedia
              component="img"
              image="/static/images/locations_edit_thumbnail.jpg"
              alt={intl.formatMessage({ id: 'page.home.edit.title.locations' })}
              sx={{ minHeight: 190 }}
            />
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>
                <FormattedMessage id="page.home.edit.title.locations" />
              </Typography>
              <Typography variant="body2">
                <FormattedMessage id="page.home.edit.intro.locations" />
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ maxWidth: 345, my: 2 }}>
            <CardMedia
              component="img"
              image="/static/images/organisations_edit_thumbnail.jpg"
              alt={intl.formatMessage({ id: 'page.home.edit.title.organisations' })}
              sx={{ minHeight: 190 }}
            />
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>
                <FormattedMessage id="page.home.edit.title.organisations" />
              </Typography>
              <Typography variant="body2">
                <FormattedMessage id="page.home.edit.intro.organisations" />
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ maxWidth: 345, my: 2 }}>
            <CardMedia
              component="img"
              image="/static/images/translations_edit_thumbnail.jpg"
              alt={intl.formatMessage({ id: 'page.home.edit.title.translations' })}
              sx={{ minHeight: 190 }}
            />
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>
                <FormattedMessage id="page.home.edit.title.translations" />
              </Typography>
              <Typography variant="body2">
                <FormattedMessage id="page.home.edit.intro.translations" />
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </>
  )
};

export default Home;
