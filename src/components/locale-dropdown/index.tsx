import {TranslationsResource} from "../../types";
import React, {FC} from "react";
import {MenuItem, Select} from "@mui/material";
import CountryFlag from "../country-flag";
import {useIntl} from "react-intl";

interface LocaleDropdownProps {
  locale: string;
  setLocale: (l: string) => void;
  translations: TranslationsResource[];
}

const LocaleDropdown: FC<LocaleDropdownProps> = ({ locale, setLocale, translations }) => {
  const intl = useIntl();
  return (
    <Select
      label={intl.formatMessage({ id: 'language.dropdown.label' })}
      variant="outlined"
      value={locale}
      onChange={(e) => setLocale(e.target.value)}
    >
      {translations.map((t) => (
        <MenuItem key={`locale-${t.id}`} value={t.id} sx={{ py: 2 }}>
          <CountryFlag code={t.id.split('-').pop().toLowerCase()} width="30" />
        </MenuItem>
      ))}
    </Select>
  );
};

export default LocaleDropdown;
