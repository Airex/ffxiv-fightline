import { DataItem } from "ngx-vis/ngx-vis";
import { AbilityUsageMap } from "./Maps/AbilityUsageMap";
import { AbilityType, DamageType } from "./Models";
import { BossAttackMap } from "./Maps";
import { IdGenerator } from "./Generators";
import { Holders } from "./Holders";
import { IColorsSettings } from "src/services/SettingsService";
import { buildEffects, calculateOffset } from "./Durations/functions";
import { StatusPart } from "./Durations/types";

type FrameData = { percentage: number; color: string; extraStyle?: string };

const forShieldCheckFilter =
  (um: AbilityUsageMap, fp: StatusPart) => (ba: BossAttackMap) =>
    ba.start >= new Date(um.startAsNumber + fp.start * 1000) &&
    ba.start <= new Date(um.startAsNumber + (fp.start + fp.length) * 1000) &&
    (!ba.fromFFLogs || ba.attack.fflogsAttackSource === "damage") &&
    ((ba.attack.rawDamage || 0) > 0 || ba.attack.type !== DamageType.None);

function shieldBreakOnFirstAbilityAt(
  holders: Holders,
  usageMap: AbilityUsageMap,
  frames: StatusPart[]
): number | undefined {
  const shieldParts = frames.filter(isShield);

  if (shieldParts.length === 0) {
    return undefined;
  }
  const firstAttack = shieldParts
    .map((it) => {
      return holders.bossAttacks
        .filter(forShieldCheckFilter(usageMap, it))
        .sort((a, b) => a.startAsNumber - b.startAsNumber)[0];
    })
    .sort((a, b) => a.startAsNumber - b.startAsNumber)[0];

  return (
    (firstAttack?.startAsNumber - usageMap.startAsNumber) / 1000 || undefined
  );
}

export function visibleFrameTemplate(
  idgen: IdGenerator,
  holders: Holders,
  colorSettings: IColorsSettings,
  statusesAsRows: boolean,
  colorfulDurations: boolean,
  item: DataItem
): string {
  if (item == null) {
    return "";
  }
  if (!idgen.isAbilityUsage(item.id)) {
    return "";
  }

  const map = holders.abilities.get(item.group);
  if (!map) {
    return "";
  }
  const usageMap = holders.itemUsages.get(item.id as string);
  const ability = usageMap.ability.ability;

  const offset = calculateOffset(ability) || 0;
  const offsetPercentage = (offset / ability.cooldown) * 100;

  const hasNote = usageMap.hasNote;

  let frames = buildEffects(holders, usageMap, offset);

  let shieldBreakAt = shieldBreakOnFirstAbilityAt(holders, usageMap, frames);

  let framesData = splitIntoPartAndColorize(
    ability.cooldown,
    frames,
    shieldBreakAt,
    colorSettings,
    statusesAsRows,
    colorfulDurations
  );

  return createItemUsageFrame(
    offsetPercentage,
    framesData,
    hasNote,
    statusesAsRows
  );
}

function splitIntoPartAndColorize(
  total: number,
  parts: StatusPart[],
  shieldBreakAt: number | undefined,
  colorSettings: IColorsSettings,
  statusesAsRows: boolean,
  colorfulDurations: boolean
): FrameData[][] {
  let acc = 0;
  const result: FrameData[][] = [];
  const sorted = parts.sort((a, b) => a.start - b.start);
  for (let i = 0; i < sorted.length; i++) {
    const part = sorted[i];
    const duration = part.length - acc;
    const brightnessValue = 1 - 0.1 * (sorted.length - i - 1);
    const brightness = statusesAsRows
      ? ""
      : `filter: brightness(${brightnessValue});`;
    const percentage = statusesAsRows
      ? (part.length / total) * 100
      : (duration / total) * 100;

    if (
      (part.type === AbilityType.SelfShield ||
        part.type === AbilityType.PartyShield) &&
      shieldBreakAt
    ) {
      result.push([
        {
          percentage: statusesAsRows
            ? (shieldBreakAt / total) * 100
            : (Math.max(0, shieldBreakAt - acc) / total) * 100,
          color: colorfulDurations
            ? colorSettings[AbilityType[part.type]] || ""
            : "",
          extraStyle: brightness,
        },
        {
          percentage: statusesAsRows
            ? ((part.length - shieldBreakAt) / total) * 100
            : (Math.min(part.length - shieldBreakAt, part.length - acc) /
                total) *
              100,
          color: colorfulDurations
            ? colorSettings[AbilityType[part.type]] || ""
            : "",
          extraStyle:
            brightness +
            "background-image: linear-gradient(90deg, black 50%, transparent 50%), linear-gradient(black 50%, transparent 50%);background-size: 2px 2px;",
        },
      ]);
    } else {
      result.push([
        {
          percentage: percentage,
          color: colorfulDurations
            ? colorSettings[AbilityType[part.type]] || ""
            : "",
          extraStyle: brightness + "",
        },
      ]);
    }
    acc += duration;
  }
  return result;
}

function createItemUsageFrame(
  offsetPercentage: number,
  items: FrameData[][],
  hasNote: boolean,
  statusesAsRows: boolean
): string {
  const noteAttribute = hasNote ? "note" : "";
  const wrapperClass = statusesAsRows
    ? "progress-wrapper-fl rows"
    : "progress-wrapper-fl";

  const partFn = (it: FrameData[]) => {
    const totalPercentage = it.reduce((acc, it) => (acc += it.percentage), 0);
    const parts = it.reduce(
      (acc, it) =>
        (acc += `<div class="progress-fl" style="width:${
          (it.percentage / totalPercentage) * 100
        }%;background-color:${it.color};${it.extraStyle}"></div>`),
      ""
    );
    return `<div class="progress-fl" style="width:${totalPercentage}%;">${parts}</div>`;
  };

  const parts = items.reduce((acc, it) => (acc += partFn(it)), "");
  const offsetPart =
    offsetPercentage > 0
      ? `<div class="progress-fl-offset" style = "width:${offsetPercentage}%"></div>`
      : "";
  return `
    <div class="progress-wrapper-fl ${noteAttribute}">
      ${offsetPart}
      <div class="${wrapperClass}">
        ${parts}
      </div>
    </div >
  `;
}

function isShield(part: StatusPart) {
  return (
    part.type === AbilityType.SelfShield ||
    part.type === AbilityType.PartyShield
  );
}
