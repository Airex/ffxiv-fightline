import { Holders } from "./Holders";
import { IAbility, IJob, IEffectVisitor, DamageType, IMitigator, SettingsEnum } from "./Models";
import { Utils } from "./Utils";

export type DefsCalcResultAbility = {
  jobId: string;
  start?: Date;
  jobName: string;
  ability: IAbility;
  id: string;
  valid: boolean;
};

export type DefsCalcResult = {
  job: IJob;
  abilities: DefsCalcResultAbility[];
}[];

export function calculateDefsForAttack(holders: Holders, attackId: string): DefsCalcResult {
  const bossAttack = holders.bossAttacks.get(attackId);

  if (!bossAttack) { return []; }

  const defAbilities = holders.itemUsages.filter((it) => {
    const ab = it.ability;
    return ab.isDef;
  });

  const intersected = defAbilities.filter((it) => {
    return it.ability.ability.statuses?.some(st => {
      const end = new Date(it.startAsNumber + st.duration * 1000);
      return it.start <= bossAttack.start && end >= bossAttack.start;
    });
  });

  const values = intersected.map((it) => {
    const jobMap = it.ability.job;
    return {
      jobId: jobMap.id,
      start: it.start,
      jobName: jobMap.job.name,
      ability: it.ability.ability,
      id: it.id,
      valid: true
    } as DefsCalcResultAbility;
  });

  const grouped = Utils.groupBy(values, x => x.jobId);

  return Object.keys(grouped).map((value) => {
    return {
      job: holders.jobs.get(value).job,
      abilities: grouped[value]
    };
  }).sort((a, b) => a.job.role - b.job.role);

}

export function calculateAvailDefsForAttack(holders: Holders, id: string): DefsCalcResult {
  const bossAttack = holders.bossAttacks.get(id);

  if (!bossAttack) { return []; }

  const defAbilities = holders.abilities.filter((it) => {
    return it.isDef;
  });

  const intersected = defAbilities.filter((it) => {
    const abilities = holders.itemUsages.getByAbility(it.id);
    return !abilities.some(ab => {
      const end = new Date(ab.startAsNumber + ab.ability.ability.cooldown * 1000);
      return ab.start <= bossAttack.start && end >= bossAttack.start;
    });

  });

  const values = intersected.map((it) => {
    const jobMap = it.job;
    return { jobId: jobMap.id, jobName: jobMap.job.name, ability: it.ability, id: it.id, valid: true } as DefsCalcResultAbility;
  });

  const grouped = Utils.groupBy(values, x => x.jobId);

  return Object.keys(grouped).map((value) => {
    return {
      job: holders.jobs.get(value).job,
      abilities: grouped[value]
    };
  }).sort((a, b) => a.job.role - b.job.role);

}

class MitigationVisitor implements IEffectVisitor {

  constructor(private holders: Holders) {

  }

  private target: string = null;
  private damageType: DamageType = DamageType.None;

  public partyMitigation = -1;
  public partyShield = 0;
  public sums = {};
  private abilityId: string;
  private jobId: string;

  delay(value: number) {
  }

  setTarget(target: string, damageType: DamageType, abilityId: string, jobId: string) {
    this.target = target;
    this.damageType = damageType;
    this.abilityId = abilityId;
    this.jobId = jobId;
  }

  mitigate(mitigator: IMitigator) {
    const self = this;
    const context = {
      jobId: self.jobId,
      abilityId: self.abilityId,
      holders: this.holders,
      addMitigationForTarget(value: number, damageType: DamageType) {
        if (self.target) {
          if (!self.sums[self.target]) { self.sums[self.target] = { shield: 0, mitigation: 1 }; }
          if (self.damageType === DamageType.None
            || damageType === DamageType.All
            || ((damageType & self.damageType) === self.damageType)) {
            self.sums[self.target].mitigation *= 1 - (value || 0) / 100;
          }
        }
      },
      addMitigationForParty(value: number, damageType: DamageType) {
        if (self.partyMitigation === -1) { self.partyMitigation = 1; }
        if (self.damageType === DamageType.None
          || damageType === DamageType.All
          || ((damageType & self.damageType) === self.damageType)) {
          self.partyMitigation *= 1 - value / 100;
        }
      },
      addShieldForTarget(value: number) {
        if (self.target) {
          if (!self.sums[self.target]) { self.sums[self.target] = { shield: 0, mitigation: 1 }; }
          self.sums[self.target].shield += value || 0;
        }
      },
      addShieldForParty(value: number) {
        if (self.partyShield === -1) { self.partyShield = 0; }
        self.partyShield += value || 0;
      }
    };
    mitigator.apply(context);
  }

  public build(holders: Holders) {
    const defStats = Object.keys(this.sums).map(s =>
    ({
      name: holders.jobs.get(s)?.job.name,
      id: s,
      mitigation: 1 - Math.abs(this.sums[s].mitigation * this.partyMitigation),
      shield: this.sums[s].shield + this.partyShield,
      icon: holders.jobs.get(s)?.job.icon
    }));
    defStats.push({
      name: "Party",
      id: "party",
      mitigation: 1 - Math.abs(this.partyMitigation),
      shield: this.partyShield,
      icon: null
    });
    return defStats;
  }

}

export type MitigationForAttack = { name: string; id: string; mitigation: number; shield: any; icon: string; };

export function calculateMitigationForAttack(
  holders: Holders,
  defs: DefsCalcResult,
  attack: { offset: string, type?: DamageType | number }
): MitigationForAttack[] {

  const abs: DefsCalcResultAbility[] = defs.reduce((ac, j) => {
    return [...ac, ...j.abilities];
  }, []);

  const bossAttackStart = Utils.getDateFromOffset(attack.offset);

  const mitigationVisitor = new MitigationVisitor(holders);

  const used = new Set();
  abs.forEach(a => {
    const settingData = holders.itemUsages.get(a.id).getSettingData(SettingsEnum.Target);
    const target = settingData?.value || a.jobId;
    mitigationVisitor.setTarget(target, attack.type, a.id, a.jobId);

    a.ability.statuses?.forEach(st => {
      if (used.has(a.ability.name) || used.has(st.shareGroup)) { return; }

      const end = new Date(a.start.valueOf() + st.duration * 1000);
      const covered = a.start <= bossAttackStart && end >= bossAttackStart;
      if (!covered) { return; }

      st.effects?.forEach(ef => {
        ef.visit(mitigationVisitor);
      });

      if (st?.shareGroup) {
        used.add(st?.shareGroup);
      }
    });
    used.add(a.ability.name);
  });

  return mitigationVisitor.build(holders);
}
