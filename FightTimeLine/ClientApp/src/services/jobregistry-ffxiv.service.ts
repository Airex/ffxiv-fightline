import {
  DRK, GNB, PLD, WAR,
  AST, SCH, SGE, WHM,
  BRD, DNC, MCH,
  DRG, MNK, NIN, RPR, SAM,
  BLM, RDM, SMN
} from "../Jobs/FFXIV/index";
import * as Models from "../core/Models";
import * as Shared from "../Jobs/FFXIV/shared";
import { BaseOverlapStrategy } from "src/core/Overlap";
import { byName } from "src/core/AbilityDetectors";
import { IJobRegistryService } from "./jobregistry.service-interface";

export class FFXIVJobRegistryService implements IJobRegistryService {
  private jobs: { [name: string]: Models.IJob };
  private level: number;

  constructor() {
    this.setLevel(90);
  }

  setLevel(level: number) {
    if (!this.jobs || this.level !== level) {
      this.jobs = [
        WAR, PLD, DRK, GNB,
        AST, SCH, SGE, WHM,
        BRD, DNC, MCH,
        DRG, MNK, NIN, RPR, SAM,
        BLM, RDM, SMN
      ].reduce((acc, j) => ({ ...acc, [j.translation.en]: this.build(j, level) }), {});
    }
  }

  public getJobs(): Models.IJob[] {
    return Object.values(this.jobs);
  }

  private build(job: Models.IJobTemplate, level: number): Models.IJob {
    const j: Models.IJob = {
      ...job,
      name: job.translation.en,
      fullName: job.fullNameTranslation.en,
      icon: this.getIcon(job.fullNameTranslation.en, "_job"),
      pets: job.pets && job.pets.map((p) => {
        return { ...p, icon: this.getIcon(job.fullNameTranslation.en, p.name) };
      }),
      stances: job.stances && job.stances.map(s => {
        return {
          ability: this.buildAbility(job.fullNameTranslation.en, s.ability)
        };
      }),
      abilities: Shared.toAbilities(job.abilities.map(a => this.buildAbility(job.fullNameTranslation.en, a)).sort(Shared.abilitySortFn))
    };

    job.traits?.sort((a, b) => a.level - b.level)
      .filter(t => t.level <= level)
      .forEach(t => {
        t.apply(j);
      });

    return j;
  }

  private getIcon(prefix: string, id: string) {
    return `/assets/images/ffhqicons/${prefix}/${id}${id.endsWith(".jpg") ? "" : ".png"}`;
  }

  private buildAbility(prefix: string, a: Models.IAbility): Models.IAbility {
    return {
      ...a,
      icon: a.icon
        ? `/assets/images/ffhqicons/${a.icon}${a.icon.endsWith(".jpg") ? "" : ".png"}`
        : this.getIcon(a.iconPrefix || prefix, (a.iconPrefix || "pve") + "_" + encodeURIComponent(a.name.replace(": ", "_"))),
      detectStrategy: a.detectStrategy || byName([a.xivDbId], [a.name]),
      overlapStrategy: a.overlapStrategy || new BaseOverlapStrategy(),
      settings: [Models.settings.note, ...(a.settings || [])]
    };
  }

  getJob(jobName: string): Models.IJob {
    const job = this.jobs[jobName];
    return job;
  }

  getAbilityForJob(jobName: string, abilityName: string): Models.IAbility {
    const job = this.getJob(jobName);
    return job.abilities[abilityName];
  }

  getStanceAbilityForJob(jobName: string, abilityName: string): Models.IAbility {
    const job = this.getJob(jobName);
    return job.stances.find((a: Models.IStance) => a.ability.name === abilityName).ability as Models.IAbility;
  }
}


