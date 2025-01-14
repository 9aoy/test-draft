import { describe, it, skip, expect, run } from 'minimal-test';
import _ from 'lodash';

console.log('load index.test.ts');

describe('Index', () => {
  it('should use lodash correctly', async () => {
    expect(_.VERSION).toBe('1');
  });

  it('should get __dirname correctly', async () => {
    expect(__dirname.includes('/test-lazy-compilation/tests/')).toBeTruthy();
  });

  skip('should get lazy correctly', async () => {
    const res = await import('../src/a');
    expect(res.a).toBe(1);
  });
  it('should add two numbers correctly', () => {
    const result = 1 + 2;
    expect(result).toBe(3);
  });

  it('should compare objects', () => {
    const obj = { name: 'test' };
    expect(obj).toEqual({ name: 'test' });
  });

  skip('should handle async tests', async () => {
    const result = await Promise.resolve(42);
    expect(result).toBeGreaterThan(40);
  });
});

await run();
