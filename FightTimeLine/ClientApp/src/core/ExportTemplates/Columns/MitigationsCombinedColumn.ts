import { calculateDefsForAttack, calculateMitigationForAttack } from "src/core/Defensives";
import { IExportColumn, IExportCell } from "src/core/ExportModels";
import { Holders } from "src/core/Holders";
import { BossAttackMap } from "src/core/Maps";
import { BaseColumnTemplate, IColumnTemplate } from "src/core/TableModels";

export class MitigationsCombinedColumn extends BaseColumnTemplate implements IColumnTemplate<BossAttackMap>{
  constructor(private holders: Holders) {
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
    const defs = calculateDefsForAttack(this.holders, attack.id);
    const mts = calculateMitigationForAttack(this.holders, defs, attack);
    return this.createJobCell(mts);
  }

  private createJobCell(mts: { name: string; id: string; mitigation: number; shield: number; icon: string; }[]) {
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
}
