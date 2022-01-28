// import * as Jobregistryserviceinterface from "./jobregistry.service-interface";
// import * as Models from "../core/Models";
// import * as Shared from "../core/Jobs/FFXIV/shared";
// import { BaseOverlapStrategy } from "src/core/Overlap";
// import { byName } from "src/core/AbilityDetectors";

// export class SWTORJobRegistryService implements Jobregistryserviceinterface.IJobRegistryService {
//   private jobs: Models.IJob[];


//   public getJobs(): Models.IJob[] {
//     return [];
//   }

//   private build(job: Models.IJob): Models.IJob {
//     return <Models.IJob>{
//       name: job.name,
//       icon: this.getIcon(job.icon),
//       defaultPet: job.defaultPet,
//       baseClass: job.baseClass,
//       role: job.role,
//       fraction: job.fraction,
//       abilities: job.abilities.map(a => this.buildAbility(a)).sort(Shared.abilitySortFn)
//     };
//   }

//   private getIcon(id: string) {
//     return `/assets/swtor/images/${id}${id.endsWith(".jpg") || id.endsWith(".png")?"":".jpg"}`;
//   }

//   private buildAbility(a: Models.IAbility): Models.IAbility {
//     return <Models.IAbility>{
//       ...a,      
//       icon: this.getIcon(a.icon),            
//       detectStrategy: a.detectStrategy || byName([a.xivDbId], [a.name]),
//       overlapStrategy: a.overlapStrategy || new BaseOverlapStrategy()
//     }
//   }

//   getJob(jobName: string): Models.IJob {
//     const job = this.jobs.find((j: Models.IJob) => j.name === jobName) as Models.IJob;
//     return job;
//   }

//   getAbilityForJob(jobName: string, abilityName: string): Models.IAbility {
//     const job = this.getJob(jobName);
//     return job.abilities.find((a: Models.IAbility) => a.name === abilityName) as Models.IAbility;
//   }

//   getStanceAbilityForJob(jobName: string, abilityName: string): Models.IAbility {
//     const job = this.getJob(jobName);
//     return job.stances.find((a: Models.IStance) => a.ability.name === abilityName).ability as Models.IAbility;
//   }
// }


