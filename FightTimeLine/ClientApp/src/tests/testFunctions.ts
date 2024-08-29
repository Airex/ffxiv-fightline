import {
  calculateDefsForAttack,
  calculateMitigationForAttack,
  getTimeGoodAbilityToUse,
} from "../core/Defensives/functions";

import { Holders } from "../core/Holders";
import { FightTimeLineController } from "../core/FightTimeLineController";
import { ITimelineContainer } from "../core/Holders/BaseHolder";
import {
  DamageType,
  DefaultTags,
  IJobStats,
  ISettingData,
  TimeOffset,
} from "../core/Models";
import { DataGroup, DataItem } from "ngx-vis/ngx-vis";
import { DataSet } from "vis-data";
import { IdGenerator } from "../core/Generators";
import { FFXIVGameService } from "../services/game-ffxiv.service";
import { PresenterManager } from "../core/PresentationManager";
import { LocalStorageService } from "../services/LocalStorageService";
import { SettingsService } from "../services/SettingsService";
import { Utils } from "../core/Utils";

type BossPlayData = {
  name?: string;
  time: TimeOffset;
  damage?: number;
  type: DamageType;
  tags: string[];
};

type JobPlayData = {
  stats: IJobStats;
  abilities: AbilityPlayData[];
};

type AbilityPlayData = {
  ability: string;
  time: TimeOffset;
  settings?: ISettingData[];
};

type Job = string;
type PlayData = Record<"boss", BossPlayData[]> | Record<Job, JobPlayData[]>;

type PlayFn = (a: PlayData) => PlayData;
type BossFn = (a: PlayData, b: BossPlayData) => BossPlayData;
type JobFn = (data: PlayData, a: JobPlayData) => JobPlayData;
type AbilityFn = (
  data: PlayData,
  job: JobPlayData,
  a: AbilityPlayData
) => AbilityPlayData;

function createHolders() {
  const mainTimeline = {
    items: new DataSet<DataItem>([], {}),
    groups: new DataSet<DataGroup>([], {}),
  } as ITimelineContainer;

  const bossTimeline = {
    items: new DataSet<DataItem>([], {}),
    groups: new DataSet<DataGroup>([], {}),
  } as ITimelineContainer;

  return new Holders(mainTimeline, bossTimeline);
}

function createController(holders) {
  const storage = new LocalStorageService();
  const settingsService = new SettingsService(storage);
  const pm = new PresenterManager(storage);
  const c = new FightTimeLineController(
    new IdGenerator(),
    holders,
    {} as any,
    new FFXIVGameService(null as any, "", "", settingsService, storage),
    settingsService,
    pm
  );
  return c;
}

function playRaw(data: PlayData) {
  const holders = createHolders();
  const c = createController(holders);

  for (const [key, value] of Object.entries(data)) {
    if (key === "boss") {
      for (const boss of value) {
        c.addBossAttack("", {
          offset: boss.time,
          type: boss.type,
          rawDamage: boss.damage,
          name: boss.name,
        });
      }
    } else {
      const job = value as JobPlayData;
      c.addJob(key, key);
      if (job.stats) {
        c.setJobStats(key, job.stats);
      }
      const abs = job.abilities;
      for (const ability of abs) {
        const abilityData = holders.abilities.getByParentAndAbility(
          key,
          ability.ability
        );
        c.addClassAbility(
          "",
          abilityData,
          ability.time,
          false,
          ability.settings && JSON.stringify(ability.settings)
        );
      }
    }
  }

  return {
    mitigate(name: string) {
      const atk = holders.bossAttacks.getByName(name)[0];
      const defs = calculateDefsForAttack(holders, atk.id);
      const result = calculateMitigationForAttack(holders, defs);
      return result;
    },
    getGoodTimeForAbility(job: string, ability: string, name: string) {
      const atk = holders.bossAttacks.getByName(name)[0];
      const abilityMap = holders.abilities.getByParentAndAbility(job, ability);
      const time = getTimeGoodAbilityToUse(
        holders,
        abilityMap,
        atk
      );
      return Utils.formatTime(time);
    },
  };
}

export function play(...data: PlayFn[]) {
  const result = data.reduce((a, b) => b(a), {} as PlayData);
  return playRaw(result);
}

export function boss(time: TimeOffset, name: string, ...mods: BossFn[]) {
  return (data: PlayData) => {
    data.boss = data.boss || [];
    let bossData = { name, time, type: DamageType.All } as any;

    for (const mod of mods) {
      bossData = mod(data, bossData);
    }

    data.boss.push(bossData);
    return data;
  };
}

export function damage(value: number) {
  return (data: PlayData, boss: BossPlayData) => {
    boss.damage = value;
    return boss;
  };
}

export function tag(value: string) {
  return (data: PlayData, boss: BossPlayData) => {
    boss.tags = boss.tags || [];
    boss.tags.push(value);
    return boss;
  };
}

export function type(value: DamageType) {
  return (data: PlayData, boss: BossPlayData) => {
    boss.type = value;
    return boss;
  };
}

export const aoe = tag(DefaultTags[1]);
export const tb = tag(DefaultTags[0]);
export const shared = tag(DefaultTags[2]);
export const physical = type(DamageType.Physical);
export const magical = type(DamageType.Magical);

function ability(
  job: Job,
  ability: string,
  time: TimeOffset,
  ...settings: AbilityFn[]
) {
  return (data: PlayData) => {
    data[job] = data[job] || { abilities: [] };

    let settingsData: ISettingData[] = [];
    let abilityData = {
      ability,
      time,
      settings: settingsData,
    } as AbilityPlayData;

    for (const fn of settings) {
      abilityData = fn(data, data[job], abilityData);
    }
    data[job].abilities = data[job].abilities || [];
    data[job].abilities.push(abilityData);
    return data;
  };
}

export function job(job: string, ...mods: JobFn[]) {
  return (data: PlayData) => {
    data[job] = data[job] || { abilities: [] };
    for (const mod of mods) {
      data[job] = mod(data, data[job]);
    }
    return data;
  };
}

export function hp(value: number) {
  return (data: PlayData, job: JobPlayData) => {
    job.stats = job.stats || {};
    job.stats.hp = value;
    return job;
  };
}

export function det(value: number) {
  return (data: PlayData, job: JobPlayData) => {
    job.stats = job.stats || {};
    job.stats.determination = value;
    return job;
  };
}

export function wd(value: number) {
  return (data: PlayData, job: JobPlayData) => {
    job.stats = job.stats || {};
    job.stats.weaponDamage = value;
    return job;
  };
}

export function main(value: number) {
  return (data: PlayData, job: JobPlayData) => {
    job.stats = job.stats || {};
    job.stats.attackMagicPotency = value;
    return job;
  };
}

export function crit(value: number) {
  return (data: PlayData, job: JobPlayData) => {
    job.stats = job.stats || {};
    job.stats.criticalHit = value;
    return job;
  };
}

export function dh(value: number) {
  return (data: PlayData, job: JobPlayData) => {
    job.stats = job.stats || {};
    job.stats.directHit = value;
    return job;
  };
}

export function tenacity(value: number) {
  return (data: PlayData, job: JobPlayData) => {
    job.stats = job.stats || {};
    job.stats.tenacity = value;
    return job;
  };
}

export function target(target: string) {
  return (data: PlayData, j: JobPlayData, ab: AbilityPlayData) => {
    if (!data[target]) {
      data[target] = { abilities: [] };
    }
    ab.settings = ab.settings || [];
    ab.settings.push({ name: "target", value: target });
    return ab;
  };
}

// Job-specific functions
const jobAbilities =
  (job: string) =>
  (time: TimeOffset, ab: string, ...settings: AbilityFn[]) =>
    ability(job, ab, time, ...settings);

export namespace jobs {
  export const AST = jobAbilities("AST");
  export const BLM = jobAbilities("BLM");
  export const BRD = jobAbilities("BRD");
  export const DNC = jobAbilities("DNC");
  export const DRG = jobAbilities("DRG");
  export const DRK = jobAbilities("DRK");
  export const GNB = jobAbilities("GNB");
  export const MCH = jobAbilities("MCH");
  export const MNK = jobAbilities("MNK");
  export const NIN = jobAbilities("NIN");
  export const PLD = jobAbilities("PLD");
  export const RDM = jobAbilities("RDM");
  export const RPR = jobAbilities("RPR");
  export const SAM = jobAbilities("SAM");
  export const SCH = jobAbilities("SCH");
  export const SGE = jobAbilities("SGE");
  export const SMN = jobAbilities("SMN");
  export const WAR = jobAbilities("WAR");
  export const WHM = jobAbilities("WHM");
}
