import chalk from 'chalk';
import fs from 'fs';
import glob from 'glob';
import tape from 'tape';
import path from 'path';
import { Test } from './classes';
import { createTapReporterStream } from './createTapReporterStream';
import { createTester } from './createTester';

const handleError = message => {
  console.error(chalk.red(message));
  process.exit(1);
};

const main = (...globs) => {
  tape.createStream()
    .pipe(createTapReporterStream())
    .pipe(process.stdout);

  const tester = createTester(tape);

  const filepathes = globs
    .map(g => {
      try {
        return glob.sync(path.resolve(process.cwd(), g))
      } catch (err) {
        handleError('Globs are invalid. it should be globs.');
      }
    })
    .reduce((whole, current) => whole.concat(current));

  if (filepathes.length === 0) {
    handleError('Globs are invalid. it does not match any files.');
  }

  const jsons = filepathes
    .map(filepath => ({ filepath, text: fs.readFileSync(filepath, 'utf8') }))
    .map(({ filepath, text }) => {
      try {
        return JSON.parse(text)
      } catch (err) {
        handleError(`${filepath} is not valid JSON format.`);
      }
    });

  // json validate入れるならこのへん

  const tests = jsons
    .map(json => new Test(json));

  tests.forEach(test => {
    const name = test.name;
    const iterable = test.getIterator();

    for (let { id, request, response } of iterable) {
      tester({ id, name, request, expectedResponse: response });
    }
  });
};

export default main;
