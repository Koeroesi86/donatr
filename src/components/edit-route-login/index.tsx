import React, {FC, useState} from "react";
import {useIntl} from "react-intl";
import {useNavigate} from "react-router-dom";
import {Box, Button, TextField} from "@mui/material";
import LoginIcon from '@mui/icons-material/Login';
import useResolveAccess from "../../hooks/useResolveAccess";

const EditRouteLogin: FC = () => {
  const resolveAccess = useResolveAccess();
  const intl = useIntl();
  const navigate = useNavigate();
  const [code, setCode] = useState('');

  return (
    <>
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
                resolveAccess(code)
                  .then(() => navigate(`/edit/${code}`))
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
              resolveAccess(code)
                .then(() => navigate(`/edit/${code}`))
                .catch(console.error);
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
