import { BaseDetailRecord } from "../lib/eiep/types";
import Table from "cli-table3";
import { format, formatISO, parseISO } from "date-fns";
import IcpSummary from "./IcpSummary";

export default class SummaryReport {
  icps: { [key: string]: IcpSummary } = {};
  dates: string[] = [];
  totalImport: number = 0;
  totalExport: number = 0;
  totalRows: number = 0;

  public addRecordToSummary(record: BaseDetailRecord): void {
    if (!this.icps.hasOwnProperty(record.icpIdentifier)) {
      this.icps[record.icpIdentifier] = new IcpSummary(record.icpIdentifier);
    }

    const icp = this.icps[record.icpIdentifier];

    icp.addRecord(record);

    this.totalImport += record.activeEnergyImport;
    this.totalExport += record.activeEnergyExport;
    this.totalRows++;

    const dateKey = formatISO(record.date);

    if (!this.dates.includes(dateKey)) {
      this.dates.push(dateKey);
    }
  }

  public showSummary(): void {
    const numberFormat = Intl.NumberFormat();

    const allDates = this.dates.sort().map((date) => {
      return format(parseISO(date), "dd/MM/yyyy");
    });

    const head = [
      "ICP",
      "Meters",
      "Import kWh",
      "Export kWh",
      "Date count",
      "Reading count",
      "Dates",
    ];

    const table = new Table({ head });

    Object.values(this.icps).forEach((icp: IcpSummary) => {
      const dates = icp.dates.sort().map((date) => {
        return format(parseISO(date), "dd/MM/yyyy");
      });

      const dateSummary =
        dates.length > 2
          ? `${dates[0]} → ${dates[dates.length - 1]}`
          : dates.join(", ");

      table.push([
        icp.identifier,
        icp.meters.join(", "),
        numberFormat.format(icp.totalImport),
        numberFormat.format(icp.totalExport),
        dates.length,
        numberFormat.format(icp.rows),
        dateSummary,
      ]);
    });

    table.push([]);

    table.push([
      `${numberFormat.format(Object.values(this.icps).length)} ICPs`,
      null,
      numberFormat.format(this.totalImport),
      numberFormat.format(this.totalExport),
      numberFormat.format(this.dates.length),
      numberFormat.format(this.totalRows),
      `${allDates[0]} - ${allDates[allDates.length - 1]}`,
    ]);

    process.stdout.write(table.toString());

    const summary = new Table({
      head: ["Rows", "Dates", "Date range"],
    });

    summary.push([
      numberFormat.format(this.totalRows),
      allDates.length,
      `${allDates[0]} → ${allDates[allDates.length - 1]}`,
    ]);

    process.stdout.write("\n");
    process.stdout.write(summary.toString());
    process.stdout.write("\n");
  }
}
