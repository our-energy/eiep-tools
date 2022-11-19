import { ReadStream } from "fs";
import EiepFilter from "../../EiepFilter";

export abstract class EiepDocument {
  type!: string;
  version!: number;
  sender!: string;
  onBehalfOf!: string;
  recipient!: string;
  dateTime!: Date;

  abstract readFromStream(
    stream: ReadStream,
    callback: (record: BaseDetailRecord) => void,
    filter?: EiepFilter
  ): Promise<void>;
}

export abstract class BaseDetailRecord {
  icpIdentifier!: string;
  flowDirection!: FlowDirection;
  activeEnergy!: number;
  reactiveEnergy!: number;
  date!: Date;

  abstract get meterSerial(): string;

  get activeEnergyImport(): number {
    return this.flowDirection === FlowDirection.IMPORT ? this.activeEnergy : 0;
  }

  get activeEnergyExport(): number {
    return this.flowDirection === FlowDirection.EXPORT ? this.activeEnergy : 0;
  }
}

export type ColumnValue = null | string | number;

export enum FlowDirection {
  EXPORT = "X",
  IMPORT = "I",
}

export enum ReadingType {
  ESTIMATE = "E",
  FINAL = "F",
}

export enum FileType {
  EIEP3 = "ICPHH",
  EIEP13A = "ICPCONS",
  UNKNOWN = "UNKNOWN",
}
