import { describe, expect, it } from 'vitest';
console.log('load react-node.test.ts');

describe('React Node', () => {
  it('test basic', () => {
    const result = 1 + 2;
    expect(result).toBe(3);
  });

  it('should server render correctly', async () => {
    const { render } = await import('../src/react/src/index.server');

    const domStr = render();
    expect(domStr.includes('Rsbuild with React')).toBeTruthy();
  });
});
