import React, {FC} from "react";
import {FormattedMessage} from "react-intl";
import {Typography} from "@mui/material";
import {Outlet} from "@mui/icons-material";

const EditRoute: FC = () => {
  return (
    <>
      <Typography variant="h3" sx={{ py: 2 }}>
        <FormattedMessage id="page.edit" />
      </Typography>
      <Outlet />
    </>
  )
};

export default EditRoute;
