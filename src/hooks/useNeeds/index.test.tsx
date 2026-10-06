import {waitFor} from "@testing-library/react";
import useNeeds from "./index";
import {renderHookWithStore} from "../../test/renderHookWithStore";
import {Need} from "../../types";

const mockApi = { all: jest.fn() };

jest.mock('../useApiClient', () => ({ __esModule: true, default: () => mockApi }));

const needs: Need[] = [
  { id: 'n1', locationId: 'l1', name: 'Fresh bread', originalName: 'Fresh bread' },
  { id: 'n2', locationId: 'l2', name: 'Blankets', originalName: 'Blankets' },
  { id: 'n3', locationId: 'l1', name: 'Bread flour', originalName: 'Bread flour' },
];
const state = { needs: Object.fromEntries(needs.map((n) => [n.id, n])) };

describe('useNeeds', () => {
  beforeEach(() => {
    mockApi.all.mockReset().mockResolvedValue([]);
  });

  it('loads the needs into the store when it is empty', async () => {
    mockApi.all.mockResolvedValue(needs);
    const { result } = renderHookWithStore(() => useNeeds());

    await waitFor(() => expect(result.current).toHaveLength(3));
  });

  it('does not fetch when the store already has needs', () => {
    renderHookWithStore(() => useNeeds(), state);

    expect(mockApi.all).not.toHaveBeenCalled();
  });

  it('sorts by name', () => {
    const { result } = renderHookWithStore(() => useNeeds(), state);

    expect(result.current.map((n) => n.id)).toEqual(['n2', 'n3', 'n1']);
  });

  it('filters by search term', () => {
    const { result } = renderHookWithStore(() => useNeeds({ search: 'Bread' }), state);

    expect(result.current.map((n) => n.id)).toEqual(['n3']);
  });

  it('filters by location', () => {
    const { result } = renderHookWithStore(() => useNeeds({ locationId: 'l1' }), state);

    expect(result.current.map((n) => n.id)).toEqual(['n3', 'n1']);
  });

  it('combines the filters', () => {
    const { result } = renderHookWithStore(() => useNeeds({ search: 'Blank', locationId: 'l1' }), state);

    expect(result.current).toEqual([]);
  });
});
