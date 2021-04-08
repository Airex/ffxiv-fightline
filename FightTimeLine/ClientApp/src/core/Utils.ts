export class Utils {
  static entityMap: { [name: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;"
  };
  static escapeHtml(source: string) {
    return String(source).replace(/[&<>"'\/]/g, (s: string) => this.entityMap[s]);
  }

  static getDateFromOffset(offset: number | string = 0, startDate?: Date): Date {
    let d = new Date(startDate || 946677600000);
    if (typeof offset === "number")
      d.setSeconds(offset);
    else {
      const parts = offset.split(":");
      const mins = Math.abs(parseInt(parts[0]));
      const secs = parseInt(parts[1]);
      const number = (offset.indexOf("-") >= 0 ? -1 : 1) * (mins * 60 * 1000 + secs * 1000);
      d = new Date(d.valueOf() as number + number);
    }

    return d;
  }

  static inRange(startOffset: string, endOffset: string, toCheckOffset: string): boolean {
    const orig = this.getDateFromOffset(toCheckOffset);
    return orig >= this.getDateFromOffset(startOffset) && orig <= this.getDateFromOffset(endOffset)
  }

  static inRangeDates(startOffset: Date, endOffset: Date, toCheckOffset: Date): boolean {
    const orig = toCheckOffset;
    return orig >= startOffset && orig <= endOffset
  }

  static formatTime(date: Date): string {
    const d = 946677600000;
    const dc = date.valueOf() as number;
    const padLeft = (nr: number, n: number, str?: string): string => new Array(n - String(nr).length + 1).join(str || "0") + nr;
    return (Math.sign(dc - d) + 1 ? "" : "-") +
      (date => `${padLeft((date).getMinutes(), 2)}:${padLeft((date as Date).getSeconds(), 2)}`).apply(null,
        [new Date(Math.abs(dc - d) + d)]);
  }

  static clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)) as T;
  }

  static groupBy<T>(input: T[], keyFn: (x: T) => string): { [key: string]: T[] } {
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

  static format(startDate: Date) {
    return {
      minorLabels: (date: Date, scale: string, step: Number) => {
        const diff = (date.valueOf() as number) - (startDate.valueOf() as number);
        var cd = new Date(Math.abs(diff) +
          (startDate.valueOf() as number));
        var result;
        switch (scale) {
          case 'second':
            result = (diff < 0 ? -1 : 1) * cd.getSeconds();
            break;
          case 'minute':
            result = (diff < 0 ? -1 : 1) * cd.getMinutes();
            break;
          default:
            return new Date(date);
        }
        return result;
      },
      majorLabels: (date: Date, scale: string, step: Number) => {
        const diff = (date.valueOf() as number) - (startDate.valueOf() as number);
        var cd = new Date(Math.abs(diff) + (startDate.valueOf() as number));
        var result;
        switch (scale) {
          case 'second':
            result = (diff < 0 ? -1 : 1) * cd.getMinutes();
            break;
          case 'minute':
            result = 0;
            break;
          default:
            return new Date(date);
        }
        return result;
      }
    };
  }

}


