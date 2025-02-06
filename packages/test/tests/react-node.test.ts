import { describe, it, expect, run } from 'minimal-test';
console.log('load react-node.test.ts');
import { mock } from 'minimal-test/mock';

mock('@mui/icons-material', (requireActual) => {
  const res = requireActual();
  console.log('call mock @mui/icons-material');
  return res;
});

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

await run();
