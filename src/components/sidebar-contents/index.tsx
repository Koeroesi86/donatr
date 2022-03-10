import React, {FC} from "react";
import {FormattedMessage} from "react-intl";
import {Box, Link, List, ListItem} from "@mui/material";
import {Link as RLink, useMatch, useResolvedPath} from "react-router-dom";

const RouteLink: FC<{ to: string; translation: string; }> = ({ children, to, translation }) => {
  const resolved = useResolvedPath(to);
  const match = useMatch({path: resolved.pathname, end: true});

  return (
    <List>
      <ListItem>
        <Link to={to} component={RLink} color="inherit" underline={match ? 'always' : 'hover'}>
          {children}
          <FormattedMessage id={translation} />
        </Link>
      </ListItem>
    </List>
  )
}

const SidebarContents: FC = () => {
  return (
    <Box sx={{ py: 2 }}>
      <List>
        <RouteLink to="/" translation="page.home"/>
        <RouteLink to="/organisations" translation="page.organisations"/>
        <RouteLink to="/needs" translation="page.needs"/>
        <RouteLink to="/login" translation="page.edit"/>
      </List>
    </Box>
  );
};

export default SidebarContents;
