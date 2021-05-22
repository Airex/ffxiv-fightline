import { PLD, WAR, DRK, WHM, SCH, AST, BRD, MCH, DRG, MNK, NIN, SAM, BLM, RDM, SMN, DNC, GNB } from "../core/Jobs/FFXIV/index"
import * as Jobregistryserviceinterface from "./jobregistry.service-interface";
import * as Models from "../core/Models";
import * as Shared from "../core/Jobs/FFXIV/shared";
import { BaseOverlapStrategy } from "src/core/Overlap";
import { byName } from "src/core/AbilityDetectors";

export class FFXIVJobRegistryService implements Jobregistryserviceinterface.IJobRegistryService {
  private jobs: { [name: string]: Models.IJob };

  constructor() {
    this.jobs = [PLD, WAR, DRK, GNB, WHM, SCH, AST, BRD, MCH, DNC, DRG, MNK, NIN, SAM, BLM, RDM, SMN].reduce((acc, j) => ({ ...acc, [j.name]: this.build(j) }), {});
  }

  public getJobs(): Models.IJob[] {
    return Object.values(this.jobs);
  }

  private build(job: Models.IJob): Models.IJob {
    return {
      ...job,
      icon: this.getIcon(job.icon),
      pets: job.pets && job.pets.map((p) => {
        return { ...p, icon: this.getIcon(p.icon) }
      }),
      stances: job.stances && job.stances.map(s => {
        return {
          ability: this.buildAbility(s.ability)
        }
      }),
      abilities: job.abilities.map(a => this.buildAbility(a)).sort(Shared.abilitySortFn)
    };
  }

  private getIcon(id: string) {
    return `/assets/images/${id}${id.endsWith(".jpg") ? "" : ".png"}`;
  }

  private buildAbility(a: Models.IAbility): Models.IAbility {
    return {
      ...a,
      icon: this.getIcon(a.icon),
      detectStrategy: a.detectStrategy || byName([a.xivDbId], [a.name]),
      overlapStrategy: a.overlapStrategy || new BaseOverlapStrategy()
    }
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


