import { createReadStream, ReadStream } from "fs";
import { Transformer } from "stream-transform";
import { parse } from "csv-parse";

import { toDate } from "date-fns-tz";
import { BaseDetailRecord, EiepDocument, FileType } from "./lib/eiep/types";

import Eiep3Document from "./lib/eiep/Eiep3/Document";
import Eiep13aDocument from "./lib/eiep/Eiep13a/Document";

export const detectFileType = async (path: string): Promise<FileType> => {
  const stream = createReadStream(path, "utf-8");

  return await new Promise((resolve) => {
    const parser = parse({
      relaxColumnCount: true,
      relaxColumnCountLess: true,
      relaxColumnCountMore: true,
      skipEmptyLines: true,
    });

    stream.pipe(parser).once("data", (chunk) => {
      const [, type] = chunk;

      switch (type) {
        case FileType.EIEP3:
          resolve(FileType.EIEP3);

        case FileType.EIEP13A:
          resolve(FileType.EIEP13A);

        default:
          resolve(FileType.UNKNOWN);
      }
    });
  });
};

export const isValidFileType = (path: string, fileType: FileType): boolean => {
  return fileType !== FileType.UNKNOWN;
};

export const autoCreateDocument = (fileType: string): EiepDocument => {
  switch (fileType) {
    case FileType.EIEP3:
      return new Eiep3Document();

    case FileType.EIEP13A:
      return new Eiep13aDocument();

    default:
      throw Error(`Cannot create document for unknown file type '${fileType}'`);
  }
};

export const streamCsv = (
  stream: ReadStream,
  callback: (record: BaseDetailRecord) => void,
  transformer: Transformer
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const parser = parse({
      relaxColumnCount: true,
      relaxColumnCountLess: true,
      relaxColumnCountMore: true,
      skipEmptyLines: true,
    });

    stream
      .pipe(parser)
      .pipe(transformer)
      .on("data", (chunk) => {
        callback(chunk);
      })
      .on("error", (error) => {
        reject(error);
      })
      .on("end", () => {
        resolve();
      });
  });
};

export const parseNumber = (value: string | null): number => {
  const output = parseFloat(value as string);

  if (isNaN(output)) {
    return 0;
  }

  return output;
};

/**
 * Converts DD/MM/YYYY & time string to a Date object
 *
 * @param {string} date DD/MM/YYYY format
 * @param {string} time HH:MM:SS format
 * @param {string} offset e.g. +13:00
 *
 * @returns {Date} The resulting date
 */
export const parseDate = (
  date: string | null,
  time: string | null = "00:00:00",
  offset: string = ""
): Date => {
  if (!date) {
    return new Date();
  }

  const parts = date.split("/");

  const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}T${time}${offset}`;

  return toDate(`${isoDate}`, {
    timeZone: "Pacific/Auckland",
  });
};
