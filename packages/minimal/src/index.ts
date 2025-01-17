import { TestRunner } from './runner';

export const runner = new TestRunner();

export const describe = runner.describe.bind(runner);

export const it = runner.it.bind(runner);
export const skip = runner.skip.bind(runner);
export { expect } from './expect';
export { setSystemTime } from './mock/timers';

export const run = () => runner.run().catch(console.error);
