import { describe, expect, it, vi } from 'vitest';
import { a, aFileName } from '../src/a';

vi.mock(import('../src/a'), async (importOriginal) => {
  const mod = await importOriginal(); // type is inferred
  return {
    ...mod,
    // replace some exports
    a: 2,
  };
});

describe('Index 1', () => {
  it('should add two numbers correctly', () => {
    const result = 1 + 2;
    expect(result).toBe(3);
  });

  it('should test issuer correctly', () => {
    expect(aFileName.endsWith('/packages/test/src/a.ts')).toBeTruthy();
    expect(a).toBe(2);
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
