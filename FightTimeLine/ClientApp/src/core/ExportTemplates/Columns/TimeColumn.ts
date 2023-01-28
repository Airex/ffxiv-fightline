import { IExportColumn, IExportCell } from "src/core/ExportModels";
import { Holders } from "src/core/Holders";
import { BossAttackMap } from "src/core/Maps";
import { BaseColumnTemplate, IColumnTemplate } from "src/core/TableModels";
import { Utils } from "src/core/Utils";

export class TimeColumn extends BaseColumnTemplate implements IColumnTemplate<BossAttackMap> {
  buildHeader(data: Holders): IExportColumn {
    return {
      text: "Time",
      name: "time",
      width: "50px",
      align: "center",
      listOfFilter: data.bossDownTime.getAll()
        .sort((a, b) => this.offsetCompareFn(Utils.formatTime(a.start), Utils.formatTime(b.start)))
        .map(d => ({ text: d.comment, value: d, byDefault: true }))
        .concat({ text: "Other", value: { comment: "Other" } as any, byDefault: true }),
      filterFn: (d, row, col) => {
        const found = col?.listOfFilter?.find(item => item.value && Utils.inRange(item.value.start, item.value.end, row.filterData.offset));

        if (found) {
          return d.some(item => item && item.comment === found.value.comment);
        }

        return d.some(item => item && item.comment === "Other");
      },
    };
  }

  buildCell(data: Holders, attack: BossAttackMap): IExportCell {
    return this.text({
      text: attack.offset,
      align: "center",
      ignoreShowText: true,
      refId: (data.bossDownTime.first(d =>
        Utils.inRange(Utils.formatTime(d.start), Utils.formatTime(d.end), attack.offset)) || { id: null }).id,
      disableUnique: true,
      colorFn: (a) => {
        const dt = data.bossDownTime.first(d => Utils.inRange(Utils.formatTime(d.start), Utils.formatTime(d.end), a.offset));
        return dt && dt.color || "";
      },
      bgRefIdFn: (a) => {
        const dt = data.bossDownTime.first(d => Utils.inRange(Utils.formatTime(d.start), Utils.formatTime(d.end), attack.offset));
        return dt && dt.id;
      }
    });
  }
}
