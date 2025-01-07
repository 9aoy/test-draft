import { TestRunner } from './runner';

export const runner = new TestRunner();

export const describe = runner.describe.bind(runner);

export const it = runner.it.bind(runner);
export { expect } from './expect';

setTimeout(async () => {
  await runner.run().catch(console.error);
}, 0);
