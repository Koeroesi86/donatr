import React, {PropsWithChildren} from "react";
import {act, renderHook} from "@testing-library/react";
import axios from "axios";
import useResolveAccess from "./index";
import {ApiTokenContext} from "../../components/api-token-provider";

jest.mock('axios');

describe('useResolveAccess', () => {
  const setToken = jest.fn();
  const wrapper = ({ children }: PropsWithChildren) => (
    <ApiTokenContext.Provider value={{ setToken, getToken: () => '' }}>{children}</ApiTokenContext.Provider>
  );

  beforeEach(() => {
    setToken.mockReset();
    jest.mocked(axios.get).mockReset();
  });

  it('resolves the access for a code and stores the issued token', async () => {
    const access = { id: 'a1', code: 'my code', all: true };
    jest.mocked(axios.get).mockResolvedValue({ data: access, headers: { 'x-access-token': 'issued-token' } });
    const { result } = renderHook(() => useResolveAccess(), { wrapper });

    await act(async () => {
      await result.current('my code');
    });

    expect(axios.get).toHaveBeenCalledWith('/api/resolve-access/my code');
    expect(setToken).toHaveBeenCalledWith('issued-token');
  });

  it('returns the resolved access', async () => {
    const access = { id: 'a1', code: 'c', all: true };
    jest.mocked(axios.get).mockResolvedValue({ data: access, headers: { 'x-access-token': 't' } });
    const { result } = renderHook(() => useResolveAccess(), { wrapper });

    expect(await result.current('c')).toEqual(access);
  });

  it('does not store a token when the code is unknown', async () => {
    jest.mocked(axios.get).mockRejectedValue(new Error('Request failed with status code 404'));
    const { result } = renderHook(() => useResolveAccess(), { wrapper });

    await expect(result.current('unknown')).rejects.toThrow('404');
    expect(setToken).not.toHaveBeenCalled();
  });
});
