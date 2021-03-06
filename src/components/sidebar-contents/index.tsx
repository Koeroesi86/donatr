import React, {FC} from "react";
import {useIntl} from "react-intl";
import {Box, Divider, IconButton, List, ListItemButton, ListItemIcon, ListItemText, useTheme} from "@mui/material";
import {Link, useMatch, useResolvedPath} from "react-router-dom";
import HomeIcon from '@mui/icons-material/Home';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ListIcon from '@mui/icons-material/List';
import EditIcon from '@mui/icons-material/Edit';
import ContactPageIcon from '@mui/icons-material/MailOutline';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Brightness4Icon from "@mui/icons-material/Brightness4";

interface RouteLinkProps {
  to: string;
  translation: string;
  onClick: () => void | Promise<void>;
}
const RouteLink: FC<RouteLinkProps> = ({ children, onClick, to, translation }) => {
  const intl = useIntl();
  const resolved = useResolvedPath(to);
  const match = useMatch({ path: resolved.pathname, end: true });

  return (
    <ListItemButton component={Link} to={to} selected={!!match} sx={{ pr: 4 }} onClick={onClick}>
      <ListItemIcon>
        {children}
      </ListItemIcon>
      <ListItemText primary={intl.formatMessage({ id: translation })} />
    </ListItemButton>
  )
}

interface SidebarContentsProps {
  onClose: () => void;
  toggleThemeMode: () => void;
}

const SidebarContents: FC<SidebarContentsProps> = ({ onClose, toggleThemeMode }) => {
  const theme = useTheme();
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: theme.spacing(0, 1),
          ...theme.mixins.toolbar,
          justifyContent: 'space-between',
        }}
      >
        <IconButton
          onClick={toggleThemeMode}
          color="inherit"
        >
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
        <IconButton onClick={onClose}>
          {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>
      <Divider />
      <List component="nav" aria-label="main public">
        <RouteLink to="/" translation="page.home" onClick={onClose}>
          <HomeIcon />
        </RouteLink>
        <RouteLink to="/organisations" translation="page.organisations" onClick={onClose}>
          <CorporateFareIcon />
        </RouteLink>
        <RouteLink to="/locations" translation="page.locations" onClick={onClose}>
          <LocationOnIcon />
        </RouteLink>
        <RouteLink to="/needs" translation="page.needs" onClick={onClose}>
          <ListIcon />
        </RouteLink>
        <RouteLink to="/contact" translation="page.contact" onClick={onClose}>
          <ContactPageIcon />
        </RouteLink>
      </List>
      <Divider />
      <List component="nav" aria-label="secondary protected">
        <RouteLink to="/edit" translation="page.edit" onClick={onClose}>
          <EditIcon />
        </RouteLink>
      </List>
    </Box>
  );
};

export default SidebarContents;
