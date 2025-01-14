import { describe, expect, it } from 'vitest';
import { a, aFileName } from '../src/a';

describe('Index 1', () => {
  it('should add two numbers correctly', () => {
    const result = 1 + 2;
    expect(result).toBe(3);
  });

  it('should test issuer correctly', () => {
    // expect(a).toBe(2);
    expect(aFileName.endsWith('/packages/test/src/a.ts')).toBeTruthy();
  });

  it('should compare objects', () => {
    const obj = { name: 'test' };
    expect(obj).toEqual({ name: 'test' });
  });

  it('should handle async tests', async () => {
    const result = await Promise.resolve(42);
    expect(result).toBeGreaterThan(40);
  });

  it.skip('should cost long time', () => {
    for (let i = 0; i < Math.pow(9, 10); i++) {
      expect(i).toBeGreaterThan(i - 1);
    }
  });
});
