import diff from 'diff';
import chalk from 'chalk';
import duplexer from 'duplexer';
import figures from 'figures';
import through2 from 'through2';
import parser from 'tap-parser';

const FIG_TICK = figures.tick;
const FIG_CROSS = figures.cross;

export const createTapReporterStream = () => {
  const output = through2()
  const p = parser();
  const stream = duplexer(p, output);
  const startedAt = new Date();

  const handleTest = name => {
    output.push('\n');
    output.push(`  ${chalk.yellow(name)}\n`);
  };

  const handleAssertSuccess = assert => {
    const name = assert.name;

    output.push(`    ${chalk.green(FIG_TICK)}  ${chalk.white(name)}\n`);
  };

  const handleAssertFailure = assert => {
    const name = assert.name;
    const diag = assert.diag;
    const writeDiff = ({ value, added, removed }) => {
      if (added)   return chalk.green.inverse(value);
      if (removed) return chalk.red.inverse(value);

      return chalk.white(value);
    };

    output.push(`    ${chalk.red(FIG_CROSS)}  ${chalk.red(name)}\n`);

    if (typeof diag.expected === 'object' && diag.expected !== null) {
      const compared = diff.diffJson(diag.actual, diag.expected)
        .map(writeDiff)
        .join('');

      output.push(`        ${compared}\n`);
    } else if (typeof diag.expected === 'string') {
      const compared = diff.diffChars(diag.actual, diag.expected)
        .map(writeDiff)
        .join('');

      output.push(`        ${compared}\n`);
    } else {
      output.push('        ' +
        chalk.red.inverse(diag.actual) +
        chalk.green.inverse(diag.expected) + '\n'
      );
    }
  };

  const handleComplete = results => {
    output.push('\n\n');
    output.push(chalk.white(`tests: ${results.count}  `));
    output.push(chalk.green(`passed: ${results.pass}  `));
    output.push(chalk.red(`failed: ${results.fail || 0}\n\n`));

    if (results.ok) {
      output.push(chalk.green(`All of ${results.count} tests passed!`));
    } else {
      output.push(chalk.red(
        `${results.fail} of ${results.count} tests failed.`
      ));
    }

    output.push('\n\n');
  };

  p.on('comment', (comment) => {
    const trimmed = comment.replace('# ', '').trim();

    if (/^tests\s+[0-9]+$/.test(trimmed)) return;
    if (/^pass\s+[0-9]+$/.test(trimmed)) return;
    if (/^fail\s+[0-9]+$/.test(trimmed)) return;
    if (/^ok$/.test(trimmed)) return;

    handleTest(trimmed);
  });

  p.on('assert', (assert) => {
    if (assert.ok) return handleAssertSuccess(assert);

    handleAssertFailure(assert);
  });

  p.on('complete', handleComplete);

  p.on('child', (child) => {
    console.log('childがあったぞ！！！');
  });

  return stream;
};
