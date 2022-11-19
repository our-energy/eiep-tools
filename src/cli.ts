#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import chalk from "chalk";

yargs(hideBin(process.argv))
  .commandDir("commands")
  .strict()
  .demandCommand()
  .fail((message: string, error: Error) => {
    process.stdout.write(chalk.red("ERROR: ") + `${error.message}\n`);
    process.exit(1);
  }).argv;
