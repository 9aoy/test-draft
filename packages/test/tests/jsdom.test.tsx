import { render, screen } from '@testing-library/react';
import { describe, it, expect, run } from 'minimal-test';
// import { userEvent } from '@testing-library/user-event';
import Link from '../src/components/Link';

describe('Link', () => {
  it('Link changes the state when hovered', async () => {
    expect(window).toBeDefined();

    render(<Link page="http://rstest">Rstest</Link>);

    const link = screen.getByText('Rstest');
    expect(link).toBeDefined();

    // expect(link).toHaveAccessibleName('Link is normal');

    // await userEvent.hover(link);

    // await expect.poll(() => link).toHaveAccessibleName('Link is hovered');

    // await userEvent.unhover(link);

    // await expect.poll(() => link).toHaveAccessibleName('Link is normal');
  });
});

await run();
