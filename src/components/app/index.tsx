import React, {FC, useEffect, useState} from "react";
import Organisations from "../organisations";
import Home from "../home";
import {Link as RLink, Route, Routes, useMatch, useResolvedPath} from "react-router-dom";
import {
  AppBar,
  Box,
  Container,
  createTheme,
  CssBaseline, Link,
  ThemeProvider,
  Toolbar,
  Typography
} from "@mui/material";
import axios from "axios";
import {FormattedMessage, IntlProvider} from "react-intl";
import {Translations} from "../../types";
import Needs from "../needs";
import LocationRoute from "../location-route";
import EditRoute from "../edit-route";

const mdTheme = createTheme();

const NavLink: FC<{ to: string }> = ({ to, children }) => {
  let resolved = useResolvedPath(to);
  let match = useMatch({ path: resolved.pathname, end: true });

  return (
    <Link to={to} component={RLink} color="inherit" sx={{ padding: '0 12px' }} underline={match ? 'always' : 'hover'}>
      {children}
    </Link>
  )
}

const App: FC = ()  => {
  const [messages, setMessages] = useState<Translations>({});
  const [locale] = useState('hu');
  useEffect(() => {
    axios.get(`/api/translations/${locale}`).then(({ data }) => setMessages(data)).catch(console.error);
  }, [locale]);

  if (Object.keys(messages).length === 0) return null;

  return (
    <ThemeProvider theme={mdTheme}>
      <IntlProvider messages={messages} locale={locale} defaultLocale="en">
      <Box sx={{ flexGrow: 1 }}>
        <CssBaseline />
        <AppBar position="static">
          <Container maxWidth="md">
            <Toolbar>
              <Typography variant="h6" component="div">
                <FormattedMessage id="site.name" />
              </Typography>
              <Box sx={{ flexGrow: 1, padding: '0 20px' }}>
                <NavLink to="/">
                  <FormattedMessage id="page.home" />
                </NavLink>
                <NavLink to="/organisations">
                  <FormattedMessage id="page.organisations" />
                </NavLink>
                <NavLink to="/needs">
                  <FormattedMessage id="page.needs" />
                </NavLink>
                <NavLink to="/edit">
                  <FormattedMessage id="page.edit" />
                </NavLink>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
        <Container maxWidth="md">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/organisations" element={<Organisations />} />
            <Route path="/needs" element={<Needs />} />
            <Route path="/location/:locationId" element={<LocationRoute/>}/>
            <Route path="/edit" element={<EditRoute />} />
          </Routes>
        </Container>
      </Box>
      </IntlProvider>
    </ThemeProvider>
  )
};

export default App;