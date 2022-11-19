import {
  ColumnValue,
  FlowDirection,
  ReadingType,
  BaseDetailRecord,
} from "../types";
import { parseNumber, parseDate } from "../../../helpers";

export default class DetailRecord extends BaseDetailRecord {
  streamIdentifier!: string;
  readingType!: ReadingType;
  tradingPeriod!: number;
  apparentEnergy!: number;
  streamType!: string | null;

  constructor(data: ColumnValue[]) {
    super();

    this.icpIdentifier = data[1] as string;
    this.streamIdentifier = data[2] as string;
    this.readingType = data[3] as ReadingType;
    this.date = parseDate(data[4] as string);
    this.tradingPeriod = parseInt(data[5] as string);
    this.activeEnergy = parseNumber(data[6] as string);
    this.reactiveEnergy = parseNumber(data[7] as string);
    this.apparentEnergy = parseNumber(data[8] as string);
    this.flowDirection = data[9] as FlowDirection;
    this.streamType = data[10] as string;
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

  get apparentEnergyImport(): number {
    return this.flowDirection === FlowDirection.IMPORT
      ? this.apparentEnergy
      : 0;
  }

  get apparentEnergyExport(): number {
    return this.flowDirection === FlowDirection.EXPORT
      ? this.apparentEnergy
      : 0;
  }

  get meterSerial(): string {
    return this.streamIdentifier;
  }
}
