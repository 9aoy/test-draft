export { setSystemTime } from './timers';

declare global {
  var mocked: Record<string, (importOriginal: () => any) => any>;
}

globalThis.mocked = globalThis.mocked || {};

export const mock = <T extends Record<string, any>>(
  moduleName: string,
  mocked: (importOriginal: () => T) => T,
) => {
  globalThis.mocked[moduleName] = mocked;
};

export const unMock = (name: string) => {
  delete globalThis.mocked[name];
};
