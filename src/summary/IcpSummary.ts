import { formatISO } from "date-fns";
import { BaseDetailRecord } from "../lib/eiep/types";

export default class IcpSummary {
  identifier: string;
  dates: string[] = [];
  meters: string[] = [];
  totalImport: number = 0;
  totalExport: number = 0;
  rows: number = 0;

  constructor(identifier: string) {
    this.identifier = identifier;
  }

  addRecord(record: BaseDetailRecord) {
    this.totalImport += record.activeEnergyImport;
    this.totalExport += record.activeEnergyExport;

    const dateKey = formatISO(record.date);

    if (!this.dates.includes(dateKey)) {
      this.dates.push(dateKey);
    }

    if (!this.meters.includes(record.meterSerial)) {
      this.meters.push(record.meterSerial);
    }

    this.rows++;
  }
}
