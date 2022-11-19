import { ReadStream } from "fs";

import { BaseDetailRecord, ColumnValue, EiepDocument } from "../types";
import DetailRecord from "../Eiep13a/DetailRecord";
import { parseDate, streamCsv } from "../../../helpers";
import { transform, Transformer } from "stream-transform";
import EiepFilter from "../../../EiepFilter";

export default class Document extends EiepDocument {
  date!: Date;
  requestId!: string;
  numRecords!: number;
  startDate!: Date;
  endDate!: Date;

  public readFromStream(
    stream: ReadStream,
    callback: (record: DetailRecord) => void,
    filter?: EiepFilter
  ): Promise<void> {
    return streamCsv(
      stream,
      (record: BaseDetailRecord) => {
        if (record !== null) {
          callback(record as DetailRecord);
        }
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

          if (filter && !filter.validate(record)) {
            callback();
            return;
          }

          callback(null, record);
          return;
      }

      callback();
    });
  }

  private parseHeader(columns: ColumnValue[]): void {
    const [
      ,
      type,
      version,
      sender,
      onBehalfOf,
      recipient,
      date,
      requestId,
      numRecords,
      startDate,
      endDate,
    ] = columns;

    this.type = type as string;
    this.version = parseFloat(version as string);
    this.sender = sender as string;
    this.onBehalfOf = onBehalfOf as string;
    this.recipient = recipient as string;
    this.date = parseDate(date as string);
    this.requestId = requestId as string;
    this.numRecords = parseInt(numRecords as string);
    this.startDate = parseDate(startDate as string);
    this.endDate = parseDate(endDate as string);
  }
}
