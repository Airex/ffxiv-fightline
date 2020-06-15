import { PLD, WAR, DRK, WHM, SCH, AST, BRD, MCH, DRG, MNK, NIN, SAM, BLM, RDM, SMN, DNC, GNB } from "../core/Jobs/FFXIV/index"
import * as Jobregistryserviceinterface from "./jobregistry.service-interface";
import * as Models from "../core/Models";
import * as Shared from "../core/Jobs/FFXIV/shared";

export class FFXIVJobRegistryService implements Jobregistryserviceinterface.IJobRegistryService {
  private jobs: Models.IJob[];


  public getJobs(): Models.IJob[] {
    return this.jobs = (this.jobs = [PLD, WAR, DRK, GNB, WHM, SCH, AST, BRD, MCH, DNC, DRG, MNK, NIN, SAM, BLM, RDM, SMN].map(j => this.build(j)));
  }

  private build(job: Models.IJob): Models.IJob {
    return {
      name: job.name,
      icon: this.getIcon(job.icon),
      defaultPet: job.defaultPet,
      fullName: job.fullName,
      pets: job.pets && job.pets.map((p) => {
        return { name: p.name, icon: this.getIcon(p.icon) }
      }),
      role: job.role,
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
      name: a.name,
      abilityType: a.abilityType,
      cooldown: a.cooldown,
      duration: a.duration,
      icon: this.getIcon(a.icon),
      activationOffset: a.activationOffset,
      pet: a.pet,
      requiresBossTarget: a.requiresBossTarget,
      extendDurationOnNextAbility: a.extendDurationOnNextAbility,
      relatedAbilities: a.relatedAbilities,
      settings: a.settings,
      xivDbId: a.xivDbId,
      xivDbType: a.xivDbType,
      charges: a.charges,
      detectStrategy: a.detectStrategy || Models.byName([a.xivDbId], [a.name]),
      overlapStrategy: a.overlapStrategy || new Models.BaseOverlapStrategy()
    }
  }

  getJob(jobName: string): Models.IJob {
    const job = this.jobs.find((j: Models.IJob) => j.name === jobName) as Models.IJob;
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


