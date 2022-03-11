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
  Drawer,
  IconButton,
  Link,
  ThemeProvider,
  Toolbar,
  Typography
} from "@mui/material";
import {FormattedMessage, IntlProvider} from "react-intl";
import MenuIcon from '@mui/icons-material/Menu';
import GitHubIcon from '@mui/icons-material/GitHub';
import {Translations, TranslationsResource} from "../../types";
import Needs from "../needs";
import LocationRoute from "../location-route";
import EditRouteProtected from "../edit-route-protected";
import EditRouteLogin from "../edit-route-login";
import {ApiClient} from "../../utils";
import LocaleDropdown from "../locale-dropdown";
import SidebarContents from "../sidebar-contents";
import LocationsRoute from "../locations-route";

const mdTheme = createTheme();

const NavLink: FC<{ to: string }> = ({ to, children }) => {
  const resolved = useResolvedPath(to);
  const match = useMatch({path: resolved.pathname, end: true});

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
            <Container maxWidth="lg">
              <Toolbar>
                <IconButton
                  size="large"
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  sx={{ mr: 2 }}
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  <MenuIcon />
                </IconButton>
                <Typography variant="h6" component="div">
                  <FormattedMessage id="site.name" />
                </Typography>
                <Box sx={{ flexGrow: 1, padding: '0 20px' }}>
                  <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <NavLink to="/">
                      <FormattedMessage id="page.home" />
                    </NavLink>
                    <NavLink to="/organisations">
                      <FormattedMessage id="page.organisations" />
                    </NavLink>
                    <NavLink to="/locations">
                      <FormattedMessage id="page.locations" />
                    </NavLink>
                    <NavLink to="/needs">
                      <FormattedMessage id="page.needs" />
                    </NavLink>
                    <NavLink to="/login">
                      <FormattedMessage id="page.edit" />
                    </NavLink>
                  </Box>
                </Box>
                <LocaleDropdown
                  locale={locale}
                  setLocale={setLocale}
                  translations={translations}
                />
              </Toolbar>
            </Container>
          </AppBar>
          <Container maxWidth="lg">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/organisations" element={<Organisations />} />
              <Route path="/needs" element={<Needs />} />
              <Route path="/locations" element={<LocationsRoute />} />
              <Route path="/locations/:locationId" element={<LocationRoute />} />
              <Route path="/login" element={<EditRouteLogin />} />
              <Route path="/edit/:code" element={<EditRouteProtected/>} />
            </Routes>
          </Container>
        </Box>
        <AppBar position="static" sx={{ mt: 2, py: 1 }}>
          <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Link href="https://github.com/Koeroesi86/help.koro.si" target="_blank" title="Github" color="inherit">
              <GitHubIcon />
            </Link>
          </Container>
        </AppBar>
        <Drawer open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
          <SidebarContents onClose={() => setIsSidebarOpen(false)} />
        </Drawer>
      </IntlProvider>
    </ThemeProvider>
  )
};

export default App;