import { describe, it, skip, expect, run } from 'minimal-test';
console.log('load react-node.test.ts');

describe('React Node', () => {
  it('test basic', () => {
    const result = 1 + 2;
    expect(result).toBe(3);
  });

  skip('should server render correctly', async () => {
    const { render } = await import('../src/react/src/index.server');

    const domStr = render();
    expect(domStr.includes('Rsbuild with React')).toBeTruthy();
  });
});

await run();
