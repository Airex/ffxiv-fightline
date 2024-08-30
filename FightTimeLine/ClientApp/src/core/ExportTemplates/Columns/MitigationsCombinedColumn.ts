import { calculateDefsForAttack, calculateMitigationForAttack } from "src/core/Defensives/functions";
import { MitigationForAttack } from "src/core/Defensives/types";
import { IExportColumn, IExportCell, ITableOptions } from "src/core/ExportModels";
import { Holders } from "src/core/Holders";
import { BossAttackMap } from "src/core/Maps";
import { BaseColumnTemplate, IColumnTemplate } from "src/core/TableModels";

export class MitigationsCombinedColumn extends BaseColumnTemplate implements IColumnTemplate<BossAttackMap>{
  constructor() {
    super();
  }
  buildHeader(data: Holders): IExportColumn {
    return {
      text: "Mitigations",
      name: "mitigations",
      refId: "mitigations",
      width: "130px"
    } as IExportColumn;
  }
  buildCell(data: Holders, attack: BossAttackMap): IExportCell {
    const defs = calculateDefsForAttack(data, attack.id);
    const mts = calculateMitigationForAttack(data, defs);
    return this.createJobCell(mts.mitigations);
  }

  private createJobCell(mts: MitigationForAttack[]) {
    const tags = this.items(mts
      .filter(m => m.mitigation > 0 || m.shield > 0)
      .map(m => {
        const name = m.id === "party" ? "Pty" : "";
        return {
          icon: m.icon,
          ignoreIconScale: true,
          ignoreShowIcon: true,
          ignoreShowText: true,
          text: `${name} M: ${(m.mitigation * 100).toFixed()}% S: ${m.shield.toFixed()}%`
        };
      }), {}
    );

    return tags;
  }

  getColumns(
    data: Holders,
    at: BossAttackMap,
    options?: ITableOptions
  ): IColumnTemplate<BossAttackMap>[] {
    return undefined;
  }
}
