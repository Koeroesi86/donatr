import React, {FC, useCallback, useEffect, useMemo, useState} from "react";
import {Link as RLink, useMatch, useResolvedPath, useRoutes} from "react-router-dom";
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
  Typography,
  useMediaQuery
} from "@mui/material";
import {FormattedMessage, IntlProvider} from "react-intl";
import MenuIcon from '@mui/icons-material/Menu';
import GitHubIcon from '@mui/icons-material/GitHub';
import {Translations, TranslationsResource} from "../../types";
import LocaleDropdown from "../locale-dropdown";
import SidebarContents from "../sidebar-contents";
import ApiTokenProvider from "../api-token-provider";
import TranslationsProvider from "../translations-provider";
import {setCookie} from "../../utils/cookies";
import routes from "../../utils/routes";

const NavLink: FC<{ to: string }> = ({ to, children }) => {
  const resolved = useResolvedPath(to);
  const match = useMatch({path: resolved.pathname, end: true});

  return (
    <Link to={to} component={RLink} color="inherit" sx={{ padding: '0 12px' }} underline={match ? 'always' : 'hover'}>
      {children}
    </Link>
  );
};

interface AppProps {
  initialLocale: string;
  initialTranslations?: Translations;
  initialMode?: 'dark' | 'light';
}

const getInitialMode = (prefersDarkMode: boolean, storedMode?: 'dark' | 'light'): 'dark'|'light' => {
  if (storedMode === 'dark' || storedMode === 'light') {
    return storedMode;
  }
  return prefersDarkMode ? 'dark' : 'light';
};

const App: FC<AppProps> = ({ initialLocale, initialTranslations = {}, initialMode })  => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: typeof window !== 'undefined' });
  const [mode, setMode] = useState<'dark'|'light'>(getInitialMode(prefersDarkMode, initialMode));
  const theme = useMemo(() => createTheme({
    palette: { mode },
  }), [mode]);
  const [messages, setMessages] = useState<Translations>(initialTranslations);
  const [locale, setLocale] = useState(initialLocale);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const routesElement = useRoutes(routes);

  const setTranslation = useCallback((translation: TranslationsResource) => {
    setLocale(translation.id);
    setMessages(translation.translations);
    if (typeof window !== 'undefined') {
      setCookie('language', translation.id, 7);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') setCookie('mode', mode, 14);
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <IntlProvider messages={messages} locale={locale} defaultLocale="en">
        <ApiTokenProvider>
          <TranslationsProvider>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
                          <NavLink to="/edit">
                            <FormattedMessage id="page.edit" />
                          </NavLink>
                        </Box>
                      </Box>
                      <LocaleDropdown
                        locale={locale}
                        setLocale={setTranslation}
                      />
                    </Toolbar>
                  </Container>
                </AppBar>
                {routesElement}
              </Box>
              <AppBar position="static" sx={{ mt: 2, py: 1 }}>
                <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Link href="https://github.com/Koeroesi86/help.koro.si" target="_blank" title="Github" color="inherit">
                    <GitHubIcon />
                  </Link>
                </Container>
              </AppBar>
            </Box>
            <Drawer open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
              <SidebarContents
                onClose={() => setIsSidebarOpen(false)}
                toggleThemeMode={() => setMode(mode === 'dark' ? 'light' : 'dark')}
              />
            </Drawer>
          </TranslationsProvider>
        </ApiTokenProvider>
      </IntlProvider>
    </ThemeProvider>
  )
};

export default App;