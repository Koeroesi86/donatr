import React, {PropsWithChildren, ReactElement} from "react";
import {render, RenderOptions} from "@testing-library/react";
import {Provider} from "react-redux";
import {MemoryRouter, Route, Routes} from "react-router-dom";
import {IntlProvider} from "react-intl";
import {createStore} from "../redux/store";
import ApiTokenProvider from "../components/api-token-provider";
import {AppState} from "../redux";
import {Translations} from "../types";

interface Options extends Omit<RenderOptions, 'wrapper'> {
  state?: Partial<AppState>;
  route?: string;
  routePath?: string;
  token?: string;
  locale?: string;
  messages?: Translations;
}

// Messages are echoed back as their id so assertions do not depend on the english copy
export const renderWithProviders = (
  ui: ReactElement,
  { state, route = '/', routePath, token = '', locale = 'en', messages = {}, ...options }: Options = {},
) => {
  const store = createStore(state);

  const Wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>
      <ApiTokenProvider initialToken={token}>
        <IntlProvider locale={locale} messages={messages} defaultLocale="en" onError={() => undefined}>
          <MemoryRouter initialEntries={[route]}>
            {routePath ? <Routes><Route path={routePath} element={children} /></Routes> : children}
          </MemoryRouter>
        </IntlProvider>
      </ApiTokenProvider>
    </Provider>
  );

  return { store, ...render(ui, { wrapper: Wrapper, ...options }) };
};
