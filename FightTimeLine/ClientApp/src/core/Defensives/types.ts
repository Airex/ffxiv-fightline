import { IAbility, IJob } from "../Models";

export type DefsCalcResultAbility = {
  jobId: string;
  start?: Date;
  jobName: string;
  ability: IAbility;
  id: string;
  valid: boolean;
};

export type MitigationForAttack = {
  name: string;
  id: string;
  mitigation: number;
  shield: number;
  absorb: number;
  hpIncrease: number;
  icon: string;
};

export type Warning = {
  message: string;
  type: "death" | "warning";
  category?: string;
  icon?: string;
  source?: string;
  priority?: number;
};

export type MitigationsResult = {
  mitigations: MitigationForAttack[];
  warnings: Warning[];
};

export type Range = { start: Date; end: Date };

export type DefsCalcResult = {
  attackId: string;
  defs: {
    jobId: string;
    job: IJob;
    abilities: DefsCalcResultAbility[];
  }[];
};

export function intersect(a: Range, b: Range) {
  if (b.start > a.end || a.start > b.end) {
    return;
  } else {
    const os = Math.max(a.start.valueOf(), b.start.valueOf());
    const oe = Math.min(a.end.valueOf(), b.end.valueOf());
    return { start: new Date(os), end: new Date(oe) } as Range;
  }
}
