import React from "react";
import {render, screen} from "@testing-library/react";
import OrganisationDescription from "./index";

describe('<OrganisationDescription />', () => {
  it('renders markdown', () => {
    render(<OrganisationDescription description={'**bold** and ~~gone~~'} />);

    expect(screen.getByText('bold').tagName).toBe('STRONG');
    expect(screen.getByText('gone').tagName).toBe('DEL');
  });

  it('opens links in a new tab', () => {
    render(<OrganisationDescription description="[Donate](https://example.com/donate)" />);

    const link = screen.getByRole('link', { name: 'Donate' });

    expect(link).toHaveAttribute('href', 'https://example.com/donate');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('keeps single line breaks', () => {
    const { container } = render(<OrganisationDescription description={'first line\nsecond line'} />);

    expect(container.querySelectorAll('br')).toHaveLength(1);
  });

  it('does not render embedded html', () => {
    const { container } = render(
      <OrganisationDescription description={'before <script>alert(1)</script><img src=x onerror="alert(1)"> after'} />
    );

    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(container).toHaveTextContent('before');
  });
});
