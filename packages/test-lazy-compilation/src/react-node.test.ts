import { describe, skip, expect, run } from 'minimal-test';
console.log('load react-node.test.ts');

describe('React Node', () => {
  skip('should server render correctly', async () => {
    const { render } = await import('./fixtures/react/src/index.server');

    const domStr = render();
    expect(domStr.includes('Rsbuild with React')).toBeTruthy();
  });
});

await run();
