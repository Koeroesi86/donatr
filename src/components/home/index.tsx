import React, {FC} from "react";
import {FormattedMessage} from "react-intl";
import {Divider, Typography} from "@mui/material";

const align: 'left' | 'center' | 'right' = 'center';

const Home: FC = () => {
  return (
    <>
      <Typography variant="h2" sx={{ my: 2 }} align={align}>
        <FormattedMessage id="page.home" />
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }} align={align}>
        <FormattedMessage id="page.home.intro" />
      </Typography>
      <Typography variant="h4" sx={{ my: 2 }} align={align}>
        <FormattedMessage id="page.home.user.title.needs" />
      </Typography>
      <Typography variant="body2" align={align}>
        <FormattedMessage id="page.home.user.intro.needs" />
      </Typography>
      <Typography variant="h4" sx={{ my: 2 }} align={align}>
        <FormattedMessage id="page.home.user.title.locations" />
      </Typography>
      <Typography variant="body2" align={align}>
        <FormattedMessage id="page.home.user.intro.locations" />
      </Typography>
      <Typography variant="h4" sx={{ my: 2 }} align={align}>
        <FormattedMessage id="page.home.user.title.organisations" />
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }} align={align}>
        <FormattedMessage id="page.home.user.intro.organisations" />
      </Typography>
      <Divider />
      <Typography variant="h2" sx={{ my: 2 }} align={align}>
        <FormattedMessage id="page.home.edit.title" />
      </Typography>
      <Typography variant="body2" align={align}>
        <FormattedMessage id="page.home.edit.intro" />
      </Typography>
      <Typography variant="h4" sx={{ my: 2 }} align={align}>
        <FormattedMessage id="page.home.edit.title.locations" />
      </Typography>
      <Typography variant="body2" align={align}>
        <FormattedMessage id="page.home.edit.intro.locations" />
      </Typography>
      <Typography variant="h4" sx={{ my: 2 }} align={align}>
        <FormattedMessage id="page.home.edit.title.organisations" />
      </Typography>
      <Typography variant="body2" align={align}>
        <FormattedMessage id="page.home.edit.intro.organisations" />
      </Typography>
      <Typography variant="h4" sx={{ my: 2 }} align={align}>
        <FormattedMessage id="page.home.edit.title.translations" />
      </Typography>
      <Typography variant="body2" align={align}>
        <FormattedMessage id="page.home.edit.intro.translations" />
      </Typography>
    </>
  )
};

export default Home;
