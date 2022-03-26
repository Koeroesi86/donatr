import React, {FC, useEffect} from "react";
import {FormattedMessage} from "react-intl";
import {CircularProgress, Container, Typography} from "@mui/material";
import {useNavigate, useOutlet, useParams} from "react-router-dom";
import useApiToken from "../../hooks/useApiToken";
import useResolveAccess from "../../hooks/useResolveAccess";

const EditRoute: FC = () => {
  const outlet = useOutlet();
  const {code} = useParams();
  const navigate = useNavigate();
  const {getToken} = useApiToken();
  const resolveAccess = useResolveAccess();
  
  useEffect(() => {
    if (code && !getToken()) {
      resolveAccess(code).catch(() => navigate('/edit'));
    }
  }, [code, getToken, navigate, resolveAccess]);

  return (
    <Container maxWidth="lg">
      <Typography variant="h3" sx={{ py: 2 }}>
        <FormattedMessage id="page.edit" />
      </Typography>
      {code && !getToken() ? <CircularProgress /> : outlet}
    </Container>
  )
};

export default EditRoute;
