import React from "react";
import {Route, Routes} from "react-router-dom";
import {screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditRouteLogin from "./index";
import {renderWithProviders} from "../../test/renderWithProviders";

const mockResolveAccess = jest.fn();

jest.mock('../../hooks/useResolveAccess', () => ({ __esModule: true, default: () => mockResolveAccess }));

const renderLogin = () => renderWithProviders(
  <Routes>
    <Route path="/edit" element={<EditRouteLogin />} />
    <Route path="/edit/:code" element={<div>protected area</div>} />
  </Routes>,
  { route: '/edit', messages: { 'input.edit.login.code': 'Access code' } },
);

describe('<EditRouteLogin />', () => {
  beforeEach(() => {
    mockResolveAccess.mockReset().mockResolvedValue({ id: 'a1', code: 'secret', all: true });
  });

  it('cannot be submitted without a code', () => {
    renderLogin();

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('opens the protected area after the code was accepted', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText('Access code'), 'secret');
    await user.click(screen.getByRole('button'));

    expect(mockResolveAccess).toHaveBeenCalledWith('secret');
    expect(await screen.findByText('protected area')).toBeInTheDocument();
  });

  it('submits with the enter key too', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText('Access code'), 'secret{Enter}');

    expect(mockResolveAccess).toHaveBeenCalledWith('secret');
    expect(await screen.findByText('protected area')).toBeInTheDocument();
  });

  it('stays on the login when the code is rejected', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockResolveAccess.mockRejectedValue(new Error('Request failed with status code 404'));
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText('Access code'), 'wrong');
    await user.click(screen.getByRole('button'));

    await waitFor(() => expect(error).toHaveBeenCalled());
    expect(screen.queryByText('protected area')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Access code')).toBeInTheDocument();
    error.mockRestore();
  });
});
