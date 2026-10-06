import React from "react";
import {render, renderHook, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {useContext} from "react";
import ApiTokenProvider, {ApiTokenContext} from "./index";
import useApiToken from "../../hooks/useApiToken";

const Consumer = () => {
  const {getToken, setToken} = useApiToken();

  return (
    <>
      <span data-testid="token">{getToken()}</span>
      <button onClick={() => setToken('renewed')}>renew</button>
    </>
  );
};

describe('<ApiTokenProvider />', () => {
  it('starts without a token', () => {
    render(<ApiTokenProvider><Consumer /></ApiTokenProvider>);

    expect(screen.getByTestId('token')).toHaveTextContent('');
  });

  it('starts with the initial token, e.g. from the server', () => {
    render(<ApiTokenProvider initialToken="from-server"><Consumer /></ApiTokenProvider>);

    expect(screen.getByTestId('token')).toHaveTextContent('from-server');
  });

  it('hands out the new token after it was set', async () => {
    render(<ApiTokenProvider initialToken="old"><Consumer /></ApiTokenProvider>);

    await userEvent.setup().click(screen.getByText('renew'));

    expect(screen.getByTestId('token')).toHaveTextContent('renewed');
  });

  it('has no token and ignores setToken when used without a provider', () => {
    const { result } = renderHook(() => useContext(ApiTokenContext));

    expect(result.current.getToken()).toBe('');
    expect(() => result.current.setToken('x')).not.toThrow();
  });
});
