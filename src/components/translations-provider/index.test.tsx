import React, {useContext} from "react";
import {render, screen} from "@testing-library/react";
import TranslationsProvider, {TranslationsContext} from "./index";

const mockApi = { all: jest.fn() };

jest.mock('../../hooks/useApiClient', () => ({ __esModule: true, default: () => mockApi }));

const Languages = () => <span>{useContext(TranslationsContext).map((t) => t.id).join(',')}</span>;

describe('<TranslationsProvider />', () => {
  it('provides the available translations sorted by id', async () => {
    mockApi.all.mockResolvedValue([
      { id: 'hu', translations: {} },
      { id: 'de', translations: {} },
      { id: 'en', translations: {} },
    ]);

    render(<TranslationsProvider><Languages /></TranslationsProvider>);

    expect(await screen.findByText('de,en,hu')).toBeInTheDocument();
  });

  it('provides nothing until the translations arrived', () => {
    mockApi.all.mockReturnValue(new Promise(() => undefined));

    const { container } = render(<TranslationsProvider><Languages /></TranslationsProvider>);

    expect(container).toHaveTextContent('');
  });
});
