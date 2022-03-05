import React, {FC} from "react";
import {FormattedMessage} from "react-intl";
import {Typography} from "@mui/material";
import EditOrganisations from "../edit-organisations";

const EditRoute: FC = () => {
  return (
    <>
      <Typography variant="h2" sx={{ py: 2 }}>
        <FormattedMessage id="page.edit" />
      </Typography>
      <EditOrganisations />
    </>
  )
};

export default EditRoute;