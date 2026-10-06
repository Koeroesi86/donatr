import React from "react";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {IntlProvider} from "react-intl";
import LocaleDropdown from "./index";
import {TranslationsContext} from "../translations-provider";
import {TranslationsResource} from "../../types";

const english: TranslationsResource = { id: 'en', translations: {} };
const hungarian: TranslationsResource = { id: 'hu-HU', translations: {} };
const german: TranslationsResource = { id: 'de', translations: {} };

const renderDropdown = (locale: string, translations: TranslationsResource[], setLocale = jest.fn()) => {
  render(
    <IntlProvider locale="en" onError={() => undefined}>
      <TranslationsContext.Provider value={translations}>
        <LocaleDropdown locale={locale} setLocale={setLocale} />
      </TranslationsContext.Provider>
    </IntlProvider>
  );

  return setLocale;
};

describe('<LocaleDropdown />', () => {
  describe('selecting the initial translation', () => {
    it('does nothing while the translations are loading', () => {
      expect(renderDropdown('en', [])).not.toHaveBeenCalled();
    });

    it('uses the translation matching the locale exactly', () => {
      expect(renderDropdown('en', [hungarian, english])).toHaveBeenCalledWith(english);
    });

    it('falls back to a translation of the same language', () => {
      expect(renderDropdown('hu', [english, hungarian])).toHaveBeenCalledWith(hungarian);
    });

    it('falls back to the first translation for an unknown locale', () => {
      expect(renderDropdown('fr', [english, hungarian])).toHaveBeenCalledWith(english);
    });
  });

  it('shows the flag of the current locale', () => {
    renderDropdown('hu-HU', [english, hungarian]);

    expect(screen.getByRole('img', { name: 'hu flag' })).toBeInTheDocument();
  });

  it('lists the available languages sorted and switches to the chosen one', async () => {
    const user = userEvent.setup();
    const setLocale = renderDropdown('en', [hungarian, english, german]);
    setLocale.mockClear();

    await user.click(screen.getByRole('button'));
    expect(screen.getAllByRole('menuitem').map((item) => item.getAttribute('aria-label'))).toEqual(['de', 'en', 'hu-HU']);

    await user.click(screen.getByRole('menuitem', { name: 'de' }));

    expect(setLocale).toHaveBeenCalledWith(german);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
