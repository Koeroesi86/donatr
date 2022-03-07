import React, {FC, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {ApiClient} from "../../utils";
import {Access} from "../../types";
import EditOrganisations from "../edit-organisations";
import {Typography} from "@mui/material";
import {FormattedMessage} from "react-intl";
import EditOrganisation from "../edit-organisation";
import EditLocation from "../edit-location";

const api = new ApiClient<Access, undefined>('access');

const EditRouteProtected: FC = () => {
  const {code} = useParams();
  const [access, setAccess] = useState<Access>();
  const navigate = useNavigate();
  
  useEffect(() => {
    api.one(code)
      .then(setAccess)
      .catch(() => navigate('/login'));
  }, [code, navigate]);
  
  if (!access) return null;

  console.log('access', access);

  return <>
    <Typography variant="h2" sx={{ py: 2 }}>
      <FormattedMessage id="page.edit" />
    </Typography>
    {"all" in access && access.all && (
      <EditOrganisations />
    )}
    {"organisationIds" in access && access.organisationIds && access.organisationIds.map((id) => (
      <EditOrganisation key={id} id={id} />
    ))}
    {"locationIds" in access && access.locationIds && access.locationIds.map((id) => (
      <EditLocation key={id} id={id} />
    ))}
  </>
};

export default EditRouteProtected;
