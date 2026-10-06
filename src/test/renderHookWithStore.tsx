import React, {PropsWithChildren} from "react";
import {Provider} from "react-redux";
import {renderHook} from "@testing-library/react";
import {createStore} from "../redux/store";

export const renderHookWithStore = <T,>(hook: () => T, state?: Parameters<typeof createStore>[0]) => {
  const store = createStore(state);
  const wrapper = ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>;

  return { store, ...renderHook(hook, { wrapper }) };
};
