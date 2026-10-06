import React, {PropsWithChildren} from "react";
import {renderHook} from "@testing-library/react";
import {IntlProvider} from "react-intl";
import axios from "axios";
import useApiClient from "./index";
import ApiTokenProvider from "../../components/api-token-provider";

jest.mock('axios');

const instance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

const wrapper = ({ children }: PropsWithChildren) => (
  <IntlProvider locale="hu-HU" onError={() => undefined}>
    <ApiTokenProvider initialToken="my-token">{children}</ApiTokenProvider>
  </IntlProvider>
);

describe('useApiClient', () => {
  beforeEach(() => {
    jest.mocked(axios.create).mockReturnValue(instance as unknown as ReturnType<typeof axios.create>);
    Object.values(instance).forEach((fn) => fn.mockReset().mockResolvedValue({ data: 'response' }));
    jest.mocked(axios.create).mockClear();
  });

  it('creates a client for the resource with the access token and the target language', () => {
    renderHook(() => useApiClient<'needs'>('needs'), { wrapper });

    const config = jest.mocked(axios.create).mock.calls[0][0];

    expect(config?.baseURL).toBe('/api/needs');
    expect(config?.headers).toEqual({ 'x-access-token': 'my-token', 'x-target-locale': 'hu' });
  });

  it('treats only responses below 400 as success', () => {
    renderHook(() => useApiClient<'needs'>('needs'), { wrapper });

    const validateStatus = jest.mocked(axios.create).mock.calls[0][0]?.validateStatus;

    expect(validateStatus?.(200)).toBe(true);
    expect(validateStatus?.(304)).toBe(true);
    expect(validateStatus?.(401)).toBe(false);
    expect(validateStatus?.(500)).toBe(false);
  });

  it('maps the methods to the rest endpoints and unwraps the response data', async () => {
    const { result } = renderHook(() => useApiClient<'locations'>('locations'), { wrapper });
    const location = { id: 'loc-1', organisationId: 'org-1', name: 'North' };

    await expect(result.current.all({ organisationId: 'org-1' })).resolves.toBe('response');
    await result.current.one('loc-1');
    await result.current.create({ organisationId: 'org-1', name: 'North' });
    await result.current.update(location);
    await result.current.remove(location);

    expect(instance.get).toHaveBeenNthCalledWith(1, '/', { params: { organisationId: 'org-1' } });
    expect(instance.get).toHaveBeenNthCalledWith(2, '/loc-1');
    expect(instance.post).toHaveBeenCalledWith('/', { organisationId: 'org-1', name: 'North' });
    expect(instance.put).toHaveBeenCalledWith('/loc-1', location);
    expect(instance.delete).toHaveBeenCalledWith('/loc-1');
  });

  it('keeps the same client between renders', () => {
    const { result, rerender } = renderHook(() => useApiClient<'needs'>('needs'), { wrapper });
    const first = result.current;
    rerender();

    expect(result.current).toBe(first);
  });
});
