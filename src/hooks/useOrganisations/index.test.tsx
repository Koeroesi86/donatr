import {waitFor} from "@testing-library/react";
import useOrganisations from "./index";
import {renderHookWithStore} from "../../test/renderHookWithStore";
import {Organisation} from "../../types";

const mockApi = { all: jest.fn() };

jest.mock('../useApiClient', () => ({ __esModule: true, default: () => mockApi }));

const organisations: Organisation[] = [
  { id: 'o2', name: 'Zeta' },
  { id: 'o1', name: 'Alpha' },
];

describe('useOrganisations', () => {
  beforeEach(() => {
    mockApi.all.mockReset().mockResolvedValue([]);
  });

  it('loads the organisations into the store and returns them sorted by name', async () => {
    mockApi.all.mockResolvedValue(organisations);
    const { result } = renderHookWithStore(() => useOrganisations());

    await waitFor(() => expect(result.current.map((o) => o.name)).toEqual(['Alpha', 'Zeta']));
  });

  it('does not fetch when the store already has organisations', () => {
    renderHookWithStore(() => useOrganisations(), { organisations: { o1: organisations[1] } });

    expect(mockApi.all).not.toHaveBeenCalled();
  });
});
