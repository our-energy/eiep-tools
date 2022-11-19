import { ColumnValue, FlowDirection, BaseDetailRecord } from "../types";
import { parseNumber, parseDate } from "../../../helpers";
import { startOfDay } from "date-fns";

export default class DetailRecord extends BaseDetailRecord {
  consumerAuthorisationCode!: string;
  responseCode!: string;
  nzdtAdjustment!: string;
  meterSerial!: string;
  registerContentCode!: string;
  periodOfAvailability!: string;
  readStart!: Date;
  readEnd!: Date;
  readStatus!: string;

  constructor(data: ColumnValue[]) {
    super();

    this.consumerAuthorisationCode = data[1] as string;
    this.icpIdentifier = data[2] as string;
    this.responseCode = data[3] as string;
    this.nzdtAdjustment = data[4] as string;
    this.meterSerial = data[5] as string;
    this.flowDirection = data[6] as FlowDirection;
    this.registerContentCode = data[7] as string;
    this.periodOfAvailability = data[8] as string;

    const [readStartDate, readStartTime] = (data[9] as string).split(" ");
    const [readEndDate, readEndTime] = (data[9] as string).split(" ");

    this.readStart = parseDate(readStartDate, readStartTime);
    this.readEnd = parseDate(readEndDate, readEndTime);
    this.date = startOfDay(this.readStart);

    this.readStatus = data[11] as string;
    this.activeEnergy = parseNumber(data[12] as string);
    this.reactiveEnergy = parseNumber(data[13] as string);
  }

  get reactiveEnergyImport(): number {
    return this.flowDirection === FlowDirection.IMPORT
      ? this.reactiveEnergy
      : 0;
  }

  get reactiveEnergyExport(): number {
    return this.flowDirection === FlowDirection.EXPORT
      ? this.reactiveEnergy
      : 0;
  }
}
