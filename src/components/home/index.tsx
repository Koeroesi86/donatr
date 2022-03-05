import React, {FC} from "react";
import {FormattedMessage} from "react-intl";
import {Typography} from "@mui/material";

const Home: FC = () => {
  return (
    <>
      <Typography variant="h2" sx={{ my: 2 }}>
        <FormattedMessage id="page.home" />
      </Typography>
    </>
  )
};

export default Home;
