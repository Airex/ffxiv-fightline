import { ITableOptions, ITableOptionSettings } from "./ExportModels";
import { TimeOffset } from "./Models";
import * as _ from "lodash";

export const startOffsetConst = 946677600000;

export class Utils {
  static entityMap: { [name: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
  };
  static escapeHtml(source: string) {
    return String(source).replace(
      /[&<>"'\/]/g,
      (s: string) => this.entityMap[s]
    );
  }

  static getDateFromOffset(
    offset: number | string = 0
  ): Date {
    let d = new Date(startOffsetConst);
    if (typeof offset === "number") {
      d.setSeconds(offset);
    } else {
      const parts = offset.split(":");
      const mins = Math.abs(+parts[0]);
      const secs = +parts[1];
      const n =
        (offset.indexOf("-") >= 0 ? -1 : 1) * (mins * 60 * 1000 + secs * 1000);
      d = new Date((d.valueOf() as number) + n);
    }

    return d;
  }

  static inRange(
    startOffset: TimeOffset,
    endOffset: TimeOffset,
    toCheckOffset: string
  ): boolean {
    const orig = this.getDateFromOffset(toCheckOffset);
    return (
      orig >= this.getDateFromOffset(startOffset) &&
      orig <= this.getDateFromOffset(endOffset)
    );
  }

  static inRangeDates(
    startOffset: Date,
    endOffset: Date,
    toCheckOffset: Date
  ): boolean {
    const orig = toCheckOffset;
    return orig >= startOffset && orig <= endOffset;
  }

  static formatTime(date: Date, showSign = false): TimeOffset {
    const d = startOffsetConst;
    const padLeft = (nr: number, n: number, str?: string): string =>
      new Array(n - String(nr).length + 1).join(str || "0") + nr;
    const dc = date.valueOf() as number;
    const plusSign = dc - d >= 0 ? (showSign && dc - d !== 0 ? "+" : "") : "-";
    const formatFuncv = (dt: Date) =>
      `${plusSign}${padLeft(dt.getMinutes(), 2)}:${padLeft(
        dt.getSeconds(),
        2
      )}` as TimeOffset;
    const formatted = formatFuncv(new Date(Math.abs(dc - d) + d));
    return formatted;
  }

  static offsetDiff(start: TimeOffset, end: TimeOffset): string {
    const result = Utils.formatTime(
      new Date(
        startOffsetConst +
          Utils.getDateFromOffset(start).valueOf() -
          Utils.getDateFromOffset(end).valueOf()
      ),
      true
    );
    if (result === "00:00") {
      return "";
    }
    return result;
  }

  static clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)) as T;
  }

  static groupBy<T>(
    input: T[],
    keyFn: (x: T) => string
  ): { [key: string]: T[] } {
    const group: { [name: string]: T[] } = {};
    input.forEach((value) => {
      const key = keyFn(value);
      if (group[key]) {
        group[key].push(value);
      } else {
        group[key] = [value];
      }
    });
    return group;
  }

  static format() {
    return {
      minorLabels: (date: Date, scale: string, step: number) => {
        const diff =
          (date.valueOf() as number) - (startOffsetConst);
        const cd = new Date(Math.abs(diff) + (startOffsetConst));
        let result;
        switch (scale) {
          case "second":
            result = (diff < 0 ? -1 : 1) * cd.getSeconds();
            break;
          case "minute":
            result = (diff < 0 ? -1 : 1) * cd.getMinutes();
            break;
          default:
            return new Date(date);
        }
        return result;
      },
      majorLabels: (date: Date, scale: string, step: number) => {
        const diff =
          (date.valueOf() as number) - (startOffsetConst);
        const cd = new Date(Math.abs(diff) + (startOffsetConst));
        let result;
        switch (scale) {
          case "second":
            result = (diff < 0 ? -1 : 1) * cd.getMinutes();
            break;
          case "minute":
            result = 0;
            break;
          default:
            return new Date(date);
        }
        return result;
      },
    };
  }

  static serializeOptions(
    values: ITableOptions,
    options: ITableOptionSettings
  ): string {
    const filtered = Object.keys(values).reduce((acc, val) => {
      const s = options.find((f) => f.name === val);
      if (s) {
        if (Array.isArray(values[val])) {
          if (!_.isEqual(s.defaultValue?.sort(), values[val].sort())) {
            acc.append(val, values[val]);
          }
        } else if (s.defaultValue !== values[val]) {
          acc.append(val, values[val]);
        }
      }
      return acc;
    }, new URLSearchParams());

    return filtered.toString();
  }


}

export function addSeconds(date: Date | number, seconds: number): Date {
  if (typeof date === "number") {
    return new Date(date + seconds * 1000);
  }
  return new Date(date.getTime() + seconds * 1000);
}

export function addMinutes(date: Date | number, minutes: number): Date {
  return addSeconds(date, minutes * 60);
}

