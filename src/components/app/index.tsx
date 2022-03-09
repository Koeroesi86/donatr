import React, {FC, useEffect, useState} from "react";
import Organisations from "../organisations";
import Home from "../home";
import {Link as RLink, Route, Routes, useMatch, useResolvedPath} from "react-router-dom";
import {
  AppBar,
  Box,
  Container,
  createTheme,
  CssBaseline,
  Link,
  MenuItem,
  Select,
  ThemeProvider,
  Toolbar,
  Typography
} from "@mui/material";
import {FormattedMessage, IntlProvider} from "react-intl";
import {Translations, TranslationsResource} from "../../types";
import Needs from "../needs";
import LocationRoute from "../location-route";
import EditRouteProtected from "../edit-route-protected";
import EditRouteLogin from "../edit-route-login";
import CountryFlag from "../country-flag";
import {ApiClient} from "../../utils";

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

const api = new ApiClient<TranslationsResource, undefined>('translations');

interface AppProps {
  initialLocale: string;
}

const App: FC<AppProps> = ({ initialLocale })  => {
  const [translations, setTranslations] = useState<TranslationsResource[]>([]);
  const [messages, setMessages] = useState<Translations>({});
  const [locale, setLocale] = useState(initialLocale);

  useEffect(() => {
    api.all().then(setTranslations)
  }, []);

  useEffect(() => {
    api.one(locale).then((t) => {
      setMessages(t.translations);
      sessionStorage.setItem('language', locale);
    });
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
                <NavLink to="/login">
                  <FormattedMessage id="page.edit" />
                </NavLink>
              </Box>
              <Select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
              >
                {translations.map((t) => (
                  <MenuItem key={`locale-${t.id}`} value={t.id} sx={{ py: 2 }}>
                    <CountryFlag code={t.id.substring(3).toLowerCase()} width="30" />
                  </MenuItem>
                ))}
              </Select>
            </Toolbar>
          </Container>
        </AppBar>
        <Container maxWidth="md">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/organisations" element={<Organisations />} />
            <Route path="/needs" element={<Needs />} />
            <Route path="/location/:locationId" element={<LocationRoute/>} />
            <Route path="/login" element={<EditRouteLogin />} />
            <Route path="/edit/:code" element={<EditRouteProtected/>} />
          </Routes>
        </Container>
      </Box>
      </IntlProvider>
    </ThemeProvider>
  )
};

export default App;