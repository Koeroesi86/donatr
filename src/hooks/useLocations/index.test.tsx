import {waitFor} from "@testing-library/react";
import useLocations from "./index";
import {renderHookWithStore} from "../../test/renderHookWithStore";
import {Location} from "../../types";

const mockApi = { all: jest.fn() };

jest.mock('../useApiClient', () => ({ __esModule: true, default: () => mockApi }));

const locations: Location[] = [
  { id: 'l1', organisationId: 'o1', name: 'South' },
  { id: 'l2', organisationId: 'o1', name: 'North' },
  { id: 'l3', organisationId: 'o2', name: 'East' },
];

describe('useLocations', () => {
  beforeEach(() => {
    mockApi.all.mockReset().mockResolvedValue([]);
  });

  it('loads the locations into the store when it is empty, sorted by name', async () => {
    mockApi.all.mockResolvedValue(locations);
    const { result, store } = renderHookWithStore(() => useLocations());

    await waitFor(() => expect(result.current.map((l) => l.name)).toEqual(['East', 'North', 'South']));
    expect(Object.keys(store.getState().locations)).toHaveLength(3);
    expect(mockApi.all).toHaveBeenCalledTimes(1);
  });

  it('does not fetch when the store already has locations', () => {
    const { result } = renderHookWithStore(() => useLocations(), { locations: { l1: locations[0] } });

    expect(result.current).toEqual([locations[0]]);
    expect(mockApi.all).not.toHaveBeenCalled();
  });

  it('filters by organisation', () => {
    const { result } = renderHookWithStore(
      () => useLocations({ organisationId: 'o1' }),
      { locations: Object.fromEntries(locations.map((l) => [l.id, l])) },
    );

    expect(result.current.map((l) => l.id)).toEqual(['l2', 'l1']);
  });

  it('survives a failing request', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockApi.all.mockRejectedValue(new Error('boom'));
    const { result } = renderHookWithStore(() => useLocations());

    await waitFor(() => expect(error).toHaveBeenCalled());
    expect(result.current).toEqual([]);
    error.mockRestore();
  });
});
