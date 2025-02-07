import { describe, it, expect, run } from 'minimal-test';
import { setSystemTime } from 'minimal-test/mock';

import { mock } from 'minimal-test/mock';

mock('@mui/icons-material', (requireActual) => {
  const res = requireActual();
  console.log('call mock @mui/icons-material');
  return { ...res, a: 1 };
});

describe('Mock', () => {
  it('should mock Date correctly', () => {
    const date = new Date(2000, 1, 1, 13);
    setSystemTime(date);
    const currentHour = new Date().getHours();

    expect(currentHour).toBe(13);
  });

  it('should mock module correctly', async () => {
    const { a } = (await import('@mui/icons-material')) as any;
    expect(a).toBe(1);
  });
});

await run();
