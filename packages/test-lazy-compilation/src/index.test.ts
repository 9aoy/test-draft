import { describe, it, expect } from 'minimal-test';
import _ from 'lodash';

console.log('load index.test.ts');

describe('Calculator', () => {
  it('should use lodash correctly', async () => {
    expect(_.VERSION).toBe('1');
  });

  it('should get lazy correctly', async () => {
    const res = await import('./a');
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

  it('should handle async tests', async () => {
    const result = await Promise.resolve(42);
    expect(result).toBeGreaterThan(40);
  });
});
