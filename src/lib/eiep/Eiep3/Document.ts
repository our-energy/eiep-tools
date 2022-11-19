import { ReadStream } from "fs";

import { BaseDetailRecord, ColumnValue, EiepDocument } from "../types";
import DetailRecord from "./DetailRecord";
import { parseDate, streamCsv } from "../../../helpers";
import { transform, Transformer } from "stream-transform";
import EiepFilter from "../../../EiepFilter";

export default class Document extends EiepDocument {
  public readFromStream(
    stream: ReadStream,
    callback: (record: DetailRecord) => void,
    filter?: EiepFilter
  ): Promise<void> {
    return streamCsv(
      stream,
      (record: BaseDetailRecord) => {
        callback(record as DetailRecord);
      },
      this.getTransformer(filter)
    );
  }

  private getTransformer(filter?: EiepFilter): Transformer {
    return transform((row, callback) => {
      const [recordType] = row;

      switch (recordType) {
        case "HDR":
          this.parseHeader(row);
          break;

        case "DET":
          const record = new DetailRecord(row);

          if (!!filter && !filter.validate(record)) {
            callback();
            return;
          }

          callback(null, record);
          return;
      }

      callback();
    });
  }

  private parseRow(row: ColumnValue[]): DetailRecord | null {
    const [recordType] = row;

    switch (recordType) {
      default:
        return null;

      case "HDR":
        this.parseHeader(row);
        return null;

      case "DET":
        return new DetailRecord(row);
    }
  }

  private parseHeader(columns: ColumnValue[]): void {
    const [, type, version, sender, onBehalfOf, recipient, date, time] =
      columns;

    this.type = type as string;
    this.version = parseFloat(version as string);
    this.sender = sender as string;
    this.onBehalfOf = onBehalfOf as string;
    this.recipient = recipient as string;
    this.dateTime = parseDate(date as string, time as string);
  }
}
