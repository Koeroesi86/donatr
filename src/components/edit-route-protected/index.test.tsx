import React from "react";
import {Route, Routes} from "react-router-dom";
import {screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditRouteProtected from "./index";
import {renderWithProviders} from "../../test/renderWithProviders";
import {Access} from "../../types";

const mockResolveAccess = jest.fn();

jest.mock('../../hooks/useResolveAccess', () => ({ __esModule: true, default: () => mockResolveAccess }));
jest.mock('../../hooks/useApiClient', () => ({ __esModule: true, default: () => ({}) }));
jest.mock('../edit-organisations', () => ({ __esModule: true, default: () => <div>all organisations editor</div> }));
jest.mock('../edit-organisation', () => ({ __esModule: true, default: ({ id }: { id: string }) => <div>organisation editor {id}</div> }));
jest.mock('../edit-location', () => ({ __esModule: true, default: ({ id }: { id: string }) => <div>location editor {id}</div> }));
jest.mock('../edit-accesses', () => ({ __esModule: true, default: ({ currentCode }: { currentCode: string }) => <div>accesses editor for {currentCode}</div> }));
jest.mock('../edit-translations', () => ({ __esModule: true, default: () => <div>translations editor</div> }));

const fullAccess: Access = { id: '1', code: 'full', all: true, translations: true };
const organisationAccess: Access = { id: '2', code: 'org', organisationIds: ['org-1', 'org-2'], translations: false };
const locationAccess: Access = { id: '3', code: 'loc', locationIds: ['loc-1'], translations: false };
const translatorAccess: Access = { id: '4', code: 'tr', locationIds: [], translations: true };

const renderProtected = (code: string) => renderWithProviders(
  <Routes>
    <Route path="/edit/:code" element={<EditRouteProtected />} />
    <Route path="/edit" element={<div>login page</div>} />
  </Routes>,
  { route: `/edit/${code}` },
);

const tabNames = () => screen.getAllByRole('tab').map((tab) => tab.textContent);

describe('<EditRouteProtected />', () => {
  it('shows a spinner while the access is being resolved', () => {
    mockResolveAccess.mockReturnValue(new Promise(() => undefined));
    renderProtected('full');

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('resolves the access for the code from the url', async () => {
    mockResolveAccess.mockResolvedValue(fullAccess);
    renderProtected('full');
    await screen.findAllByRole('tab');

    expect(mockResolveAccess).toHaveBeenCalledWith('full');
  });

  it('sends the visitor back to the login when the code is rejected', async () => {
    mockResolveAccess.mockRejectedValue(new Error('404'));
    renderProtected('wrong');

    expect(await screen.findByText('login page')).toBeInTheDocument();
  });

  it('gives full access every editor and starts with the organisations', async () => {
    mockResolveAccess.mockResolvedValue(fullAccess);
    renderProtected('full');

    await screen.findAllByRole('tab');

    expect(tabNames()).toEqual(['page.edit.organisations.title', 'page.edit.accesses.title', 'edit.translations.title']);
    expect(screen.getByText('all organisations editor')).toBeInTheDocument();
  });

  it('lets an organisation owner edit only its organisations', async () => {
    mockResolveAccess.mockResolvedValue(organisationAccess);
    renderProtected('org');

    await screen.findAllByRole('tab');

    expect(tabNames()).toEqual(['page.edit.organisations.title']);
    expect(screen.getByText('organisation editor org-1')).toBeInTheDocument();
    expect(screen.getByText('organisation editor org-2')).toBeInTheDocument();
    expect(screen.queryByText('all organisations editor')).not.toBeInTheDocument();
  });

  it('lets a location owner edit only its locations', async () => {
    mockResolveAccess.mockResolvedValue(locationAccess);
    renderProtected('loc');

    await screen.findAllByRole('tab');

    expect(tabNames()).toEqual(['page.edit.locations.title']);
    expect(screen.getByText('location editor loc-1')).toBeInTheDocument();
  });

  it('lets a translator edit only the translations', async () => {
    mockResolveAccess.mockResolvedValue(translatorAccess);
    renderProtected('tr');

    await screen.findAllByRole('tab');

    expect(tabNames()).toEqual(['edit.translations.title']);
    expect(screen.getByText('translations editor')).toBeInTheDocument();
  });

  it('switches between the editors and passes the code to the accesses editor', async () => {
    mockResolveAccess.mockResolvedValue(fullAccess);
    renderProtected('full');
    const user = userEvent.setup();

    await user.click(await screen.findByRole('tab', { name: 'page.edit.accesses.title' }));

    expect(screen.getByText('accesses editor for full')).toBeInTheDocument();
    expect(screen.queryByText('all organisations editor')).not.toBeInTheDocument();
  });
});
