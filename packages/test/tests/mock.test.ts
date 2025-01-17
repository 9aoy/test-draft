import { describe, it, expect, run, setSystemTime } from 'minimal-test';

describe('Mock', () => {
  it('should mock Date correctly', () => {
    const date = new Date(2000, 1, 1, 13);
    setSystemTime(date);
    const currentHour = new Date().getHours();

    expect(currentHour).toBe(13);
  });
});

await run();
