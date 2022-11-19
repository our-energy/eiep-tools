import type { Arguments, CommandBuilder } from "yargs";
import fs from "fs";
import path, { basename } from "path";
import { glob } from "glob";
import { createSpinner } from "nanospinner";

import {
  isValidFileType,
  autoCreateDocument,
  detectFileType,
} from "../helpers";

import { BaseDetailRecord } from "../lib/eiep/types";

import SummaryReport from "../summary/SummaryReport";
import EiepFilter from "../EiepFilter";

type Options = {
  filename: string;
  filter: string | undefined;
};

export const command: string = "summary <filename>";
export const desc: string = "Displays a summary of reading data";

export const builder: CommandBuilder<Options, Options> = (yargs) => {
  return yargs
    .positional("filename", {
      type: "string",
      demandOption: true,
      normalize: true,
    })
    .positional("filter", {
      type: "string",
      demandOption: false,
    });
};

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { filename, filter: filterString } = argv;

  let processedFiles = 0;

  const filter = EiepFilter.parse(filterString);

  const filePath = path.join(process.cwd(), filename);

  const matches = glob.sync(filePath);

  if (!matches.length) {
    process.stdout.write("Can't find file\n");
    process.exit(0);
  }

  const summary = new SummaryReport();

  process.stdout.write("\n");

  await Promise.all(
    matches.map(async (path: string) => {
      const spinner = createSpinner(basename(path)).start();

      const fileType = await detectFileType(path);

      if (!isValidFileType(path, fileType)) {
        spinner.error({ text: `${basename(path)} - Invalid file type` });
        return;
      }

      const readStream = fs.createReadStream(path, "utf-8");
      const report = autoCreateDocument(fileType);

      await report.readFromStream(
        readStream,
        (record: BaseDetailRecord) => {
          summary.addRecordToSummary(record);
        },
        filter
      );

      spinner.success();
      processedFiles++;
    })
  );

  process.stdout.write("\n");

  summary.showSummary();

  process.exit(0);
};
