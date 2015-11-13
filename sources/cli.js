#!/usr/bin/env node

import _ from 'babel/polyfill';
import chalk from 'chalk';
import commander from 'commander';
import main from './main';

commander
  .version('0.0.1')
  .usage('<globs ...>')
  .parse(process.argv);

if (commander.args.length === 0) {
  console.log(chalk.white('Use -h option to know how to use.'));
  process.exit(0);
}

main(...commander.args);
