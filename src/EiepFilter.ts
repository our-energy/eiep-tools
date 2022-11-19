import { isAfter, isBefore, isSameDay, isValid } from "date-fns";
import { parseDate } from "./helpers";
import { BaseDetailRecord } from "./lib/eiep/types";

const isSameDayOrAfter = (leftDate: Date, rightDate: Date) => {
  return isSameDay(leftDate, rightDate) || isAfter(leftDate, rightDate);
};

const isSameDayOrBefore = (leftDate: Date, rightDate: Date) => {
  return isSameDay(leftDate, rightDate) || isBefore(leftDate, rightDate);
};

export default class EiepFilter {
  icps: string[] = [];
  dateStart!: Date | null;
  dateEnd!: Date | null;

  public addIcp(icp: string) {
    icp = icp.trim();

    if (icp.length) {
      this.icps.push(icp);
    }
  }

  public setDateStart(date: string) {
    this.dateStart = parseDate(date);

    if (!isValid(this.dateStart)) {
      throw Error(`${date} is not a valid start date`);
    }
  }

  public setDateEnd(date: string) {
    this.dateEnd = parseDate(date);

    if (!isValid(this.dateEnd)) {
      throw Error(`${date} is not a valid end date`);
    }
  }

  public set(key: string, value: string) {
    switch (key) {
      case "icp":
        this.addIcp(value);
        break;

      case "dateStart":
        this.setDateStart(value);
        break;

      case "dateEnd":
        this.setDateEnd(value);
        break;
    }
  }

  public validate(record: BaseDetailRecord): boolean {
    if (this.icps.length && !this.icps.includes(record.icpIdentifier)) {
      return false;
    }

    if (this.dateStart && !isSameDayOrAfter(record.date, this.dateStart)) {
      return false;
    }

    if (this.dateEnd && !isSameDayOrBefore(record.date, this.dateEnd)) {
      return false;
    }

    return true;
  }

  public static parse(filterString?: string): EiepFilter {
    const filter = new EiepFilter();

    if (typeof filterString !== "string" || !filterString) {
      return filter;
    }

    filterString
      .split(",")
      .map((property) => property.replace(/[ ]+/g, ""))
      .map((property) => {
        const [key, value] = property.split("=");

        filter.set(key, value);
      });

    return filter;
  }
}
