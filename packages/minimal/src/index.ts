import { TestRunner } from './runner';

export const runner = new TestRunner();

export const describe = runner.describe.bind(runner);

export const it = runner.it.bind(runner);
export const skip = runner.skip.bind(runner);
export { expect } from './expect';

export const run = () => runner.run().catch(console.error);
