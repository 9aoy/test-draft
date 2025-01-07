import { describe, it, expect } from 'minimal-test';

console.log('load index2.test.ts');
describe('Calculator 2', () => {
  it('should compare objects', () => {
    const obj = { name: 'test' };
    expect(obj).toEqual({ name: 'test' });
  });
});
