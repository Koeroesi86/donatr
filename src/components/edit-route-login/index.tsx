import React, {FC, useState} from "react";
import {FormattedMessage, useIntl} from "react-intl";
import {useNavigate} from "react-router-dom";
import {Box, Button, TextField, Typography} from "@mui/material";
import LoginIcon from '@mui/icons-material/Login';
import {Access, AccessFilters} from "../../types";
import {ApiClient} from "../../utils";

const api = new ApiClient<Access, undefined, AccessFilters>('access');

const EditRouteLogin: FC = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [code, setCode] = useState('');

  return (
    <>
      <Typography variant="h3" sx={{ py: 2 }}>
        <FormattedMessage id="page.edit" />
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', py: 1 }}>
        <Box sx={{ flexGrow: 1, px: 1 }}>
          <TextField
            label={intl.formatMessage({ id: 'input.edit.login.code' })}
            variant="standard"
            fullWidth
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                api.all({ code })
                  .then(([access]) => {
                    if (access) {
                      navigate(`/edit/${code}`);
                    }
                  })
                  .catch(console.error);
              }
            }}
          />
        </Box>
        <Box>
          <Button
            variant="contained"
            disabled={!code}
            onClick={() => {
              api.one(code).then(() => {
                api.one(code)
                  .then(() => navigate(`/edit/${code}`))
                  .catch(console.error);
              });
            }}
          >
            <LoginIcon />
          </Button>
        </Box>
      </Box>
    </>
  );
}

export default EditRouteLogin;
