import React from "react";
import {screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Needs from "./index";
import {renderWithProviders} from "../../test/renderWithProviders";
import {Location, Need} from "../../types";

const mockNeedsApi = { all: jest.fn() };
const mockLocationsApi = { one: jest.fn() };

jest.mock('../../hooks/useApiClient', () => ({
  __esModule: true,
  default: (resource: string) => resource === 'needs' ? mockNeedsApi : mockLocationsApi,
}));
jest.mock('../map-block', () => ({
  __esModule: true,
  SizedMapBlock: ({ markers }: { markers: { key: string }[] }) => <div>map with {markers.length} markers</div>,
}));

const need = (id: string, name: string, locationId: string): Need => ({ id, name, originalName: name, locationId });
const bread = need('n1', 'Fresh bread', 'l1');
const blankets = need('n2', 'Blankets', 'l2');
const withGeo: Location = { id: 'l1', organisationId: 'o1', name: 'North', location: { lat: 47, lng: 19, text: 'Budapest' } };
const withoutGeo: Location = { id: 'l2', organisationId: 'o1', name: 'South' };

const renderNeeds = (route = '/needs') => renderWithProviders(<Needs />, {
  route,
  messages: { 'input.needs.search.label': 'Search needs', 'page.needs.location.link': 'location' },
});

describe('<Needs />', () => {
  beforeEach(() => {
    mockNeedsApi.all.mockReset().mockResolvedValue([blankets, bread]);
    mockLocationsApi.one.mockReset().mockImplementation(async (id: string) => id === 'l1' ? withGeo : withoutGeo);
  });

  it('lists the needs sorted by name, each linking to its location', async () => {
    renderNeeds();

    await screen.findByText('Blankets');

    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Blanketslocation',
      'Fresh breadlocation',
    ]);
    expect(screen.getAllByRole('link', { name: 'location' }).map((link) => link.getAttribute('href')))
      .toEqual(['/locations/l2', '/locations/l1']);
  });

  it('does not show a map while no search was made', async () => {
    renderNeeds();

    await screen.findByText('Blankets');

    expect(screen.queryByText(/map with/)).not.toBeInTheDocument();
    expect(mockLocationsApi.one).not.toHaveBeenCalled();
  });

  it('searches as the visitor types and marks the matching locations on the map', async () => {
    const user = userEvent.setup();
    mockNeedsApi.all.mockImplementation(async ({ search }: { search: string }) => search ? [bread] : [blankets, bread]);
    renderNeeds();
    await screen.findByText('Blankets');

    await user.type(screen.getByLabelText('Search needs'), 'bread');

    await waitFor(() => expect(mockNeedsApi.all).toHaveBeenLastCalledWith({ search: 'bread' }));
    await waitFor(() => expect(screen.queryByText('Blankets')).not.toBeInTheDocument());
    expect(screen.getByText('Fresh bread')).toBeInTheDocument();
    expect(mockLocationsApi.one).toHaveBeenCalledWith('l1');
    expect(await screen.findByText('map with 1 markers')).toBeInTheDocument();
  });

  it('leaves locations without coordinates off the map', async () => {
    mockNeedsApi.all.mockResolvedValue([blankets]);
    renderNeeds('/needs?s=blankets');

    await waitFor(() => expect(mockLocationsApi.one).toHaveBeenCalledWith('l2'));

    expect(screen.queryByText(/map with/)).not.toBeInTheDocument();
  });

  it('starts with the search term from the url', async () => {
    renderNeeds('/needs?s=flour');

    expect(screen.getByLabelText('Search needs')).toHaveValue('flour');
    await waitFor(() => expect(mockNeedsApi.all).toHaveBeenCalledWith({ search: 'flour' }));
  });

  it('clears the search', async () => {
    const user = userEvent.setup();
    renderNeeds('/needs?s=flour');
    await screen.findByText('Blankets');

    await user.click(screen.getByRole('button'));

    expect(screen.getByLabelText('Search needs')).toHaveValue('');
    await waitFor(() => expect(mockNeedsApi.all).toHaveBeenLastCalledWith({ search: '' }));
    expect(screen.queryByText(/map with/)).not.toBeInTheDocument();
  });
});
