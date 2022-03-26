import React, {FC} from "react";
import {useLocation} from "react-router-dom";
import {FormattedMessage} from "react-intl";
import {Box, Container, Typography} from "@mui/material";

const NotFoundRoute: FC = () => {
  const location = useLocation();
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 2 }}>
        <Typography variant="h3">
          <FormattedMessage id="page.notfound.title" />
        </Typography>
        <Typography>
          <FormattedMessage id="page.notfound.description" values={{ path: location.pathname }} />
        </Typography>
      </Box>
    </Container>
  );
};

export default NotFoundRoute;
