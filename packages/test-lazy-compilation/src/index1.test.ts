import { describe, it, expect, run } from 'minimal-test';

console.log('load index1.test.ts');
describe('Index 1', () => {
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

  it('should cost long time', () => {
    for (let i = 0; i < Math.pow(8, 9); i++) {
      expect(i).toBeGreaterThan(i - 1);
    }
  });
});

await run();
