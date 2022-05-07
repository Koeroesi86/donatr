import React, {FC, useCallback, useContext, useEffect, useState} from "react";
import {Box, IconButton, Menu, MenuItem, Tooltip} from "@mui/material";
import {useIntl} from "react-intl";
import CountryFlag from "../country-flag";
import {TranslationsContext} from "../translations-provider";
import {TranslationsResource} from "../../types";

interface LocaleDropdownProps {
  locale: string;
  setLocale: (translation: TranslationsResource) => void;
}

const LocaleDropdown: FC<LocaleDropdownProps> = ({ locale, setLocale }) => {
  const intl = useIntl();
  const translations = useContext(TranslationsContext);
  const [anchorElement, setAnchorElement] = useState(null);
  const open = Boolean(anchorElement);
  const handleClick = useCallback((event: React.SyntheticEvent) => {
    setAnchorElement(event.currentTarget);
  }, []);
  const handleClose = useCallback(() => {
    setAnchorElement(null);
  }, []);
  useEffect(() => {
    if (translations.length === 0) {
      return;
    }

    let current = translations.find((t) => t.id === locale);
    if (current) {
      setLocale(current);
      return;
    }
    
    current = translations.find((t) => t.id.startsWith(locale));
    if (current) {
      setLocale(current);
      return;
    }

    setLocale(translations[0]);
  }, [locale, setLocale, translations]);
  return (
    <>
      <Tooltip title={intl.formatMessage({ id: 'language.dropdown.label' })}>
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{ ml: 2 }}
          aria-controls={open ? 'locales-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <CountryFlag code={locale.split('-').pop().toLowerCase()} width="30" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorElement}
        open={open}
        onClose={handleClose}
      >
        {translations.sort((a, b) => a.id.localeCompare(b.id)).map((t) => (
          <MenuItem
            key={`locale-${t.id}`}
            value={t.id}
            sx={{ py: 2 }}
            onClick={() => {
              setLocale(t);
              handleClose();
            }}
            aria-label={t.id}
          >
            <CountryFlag code={t.id.split('-').pop().toLowerCase()} width="30" />
            <Box sx={{ px: 1, display: { xs: 'none', md: 'block' } }}>{t.id}</Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LocaleDropdown;
