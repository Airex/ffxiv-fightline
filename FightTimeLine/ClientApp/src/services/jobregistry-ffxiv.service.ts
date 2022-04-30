import {
  DRK, GNB, PLD, WAR,
  AST, SCH, SGE, WHM,
  BRD, DNC, MCH,
  DRG, MNK, NIN, RPR, SAM,
  BLM, RDM, SMN
} from "../Jobs/FFXIV/index";
import * as Jobregistryserviceinterface from "./jobregistry.service-interface";
import * as Models from "../core/Models";
import * as Shared from "../Jobs/FFXIV/shared";
import { BaseOverlapStrategy } from "src/core/Overlap";
import { byName } from "src/core/AbilityDetectors";

export class FFXIVJobRegistryService implements Jobregistryserviceinterface.IJobRegistryService {
  private jobs: { [name: string]: Models.IJob };

  constructor() {
    this.jobs = [
      WAR, PLD, DRK, GNB,
      AST, SCH, SGE, WHM,
      BRD, DNC, MCH,
      DRG, MNK, NIN, RPR, SAM,
      BLM, RDM, SMN
    ].reduce((acc, j) => ({ ...acc, [j.name]: this.build(j) }), {});
  }

  public getJobs(): Models.IJob[] {
    return Object.values(this.jobs);
  }

  private build(job: Models.IJob): Models.IJob {
    return {
      ...job,
      icon: this.getIcon(job.fullName, "_job"),
      pets: job.pets && job.pets.map((p) => {
        return { ...p, icon: this.getIcon(job.fullName, p.name) };
      }),
      stances: job.stances && job.stances.map(s => {
        return {
          ability: this.buildAbility(job.fullName, s.ability)
        };
      }),
      abilities: job.abilities.map(a => this.buildAbility(job.fullName, a)).sort(Shared.abilitySortFn)
    };
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
    return job.abilities.find((a: Models.IAbility) => a.name === abilityName) as Models.IAbility;
  }

  getStanceAbilityForJob(jobName: string, abilityName: string): Models.IAbility {
    const job = this.getJob(jobName);
    return job.stances.find((a: Models.IStance) => a.ability.name === abilityName).ability as Models.IAbility;
  }
}


