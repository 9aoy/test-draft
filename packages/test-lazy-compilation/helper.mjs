import { glob } from 'tinyglobby';

export const globFiles = async (
  include = ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
  exclude = ['**/node_modules/**', '**/dist/**'],
  cwd = process.cwd(),
) => {
  const globOptions = {
    dot: true,
    cwd,
    ignore: exclude,
  };

  const files = await glob(include, globOptions);
  return files;
};
