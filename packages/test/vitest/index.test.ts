import { describe, expect, it } from 'vitest';
import _ from 'lodash';

describe('Index', () => {
  it('should use lodash correctly', async () => {
    expect(_.VERSION).toBe('1');
  });

  it('should get __dirname correctly', async () => {
    expect(__dirname.includes('/packages/test/vitest')).toBeTruthy();
    expect(
      __filename.endsWith('/packages/test/vitest/index.test.ts'),
    ).toBeTruthy();
  });

  it('should get lazy correctly', async () => {
    const res = await import('../src/a');
    expect(res.a).toBe(1);
    expect(res.aFileName.endsWith('/packages/test/src/a.ts')).toBeTruthy();
  });
  it('should add two numbers correctly', () => {
    const result = 1 + 2;
    expect(result).toBe(3);
  });

  it('should compare objects', () => {
    const obj = { name: 'test' };
    expect(obj).toEqual({ name: 'test' });
  });

  it('should handle async tests', async () => {
    const result = await Promise.resolve(42);
    expect(result).toBeGreaterThan(40);
  });
});
