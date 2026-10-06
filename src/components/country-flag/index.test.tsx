import React from "react";
import {render, screen} from "@testing-library/react";
import CountryFlag from "./index";

describe('<CountryFlag />', () => {
  it('shows the flag of the country code', () => {
    render(<CountryFlag code="hu" />);

    const flag = screen.getByRole('img', { name: 'hu flag' });

    expect(flag).toHaveAttribute('src', 'https://flagcdn.com/hu.svg');
    expect(flag).toHaveAttribute('width', '30');
  });

  it('accepts a custom width', () => {
    render(<CountryFlag code="us" width="60" />);

    expect(screen.getByRole('img')).toHaveAttribute('width', '60');
  });
});
