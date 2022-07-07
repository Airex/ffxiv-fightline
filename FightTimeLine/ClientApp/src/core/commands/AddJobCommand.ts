import { Command, ICommandExecutionContext, ICommandData } from "../UndoRedo";
import { Role, EntryType } from "../Models";
import { AbilityMap, JobMap } from "../Maps/index";


export class AddJobCommand extends Command {

  constructor(
    private id: string,
    private jobName: string,
    private actorName: string,
    private prevBossTarget: string,
    private doUpdates: boolean,
    private pet: string,
    private collapsed: boolean) {
    super();
  }

  serialize(): ICommandData {
    return {
      name: "addJob",
      params: {
        id: this.id,
        jobName: this.jobName,
        prevBossTarget: this.prevBossTarget,
        doUpdates: this.doUpdates,
        actorName: this.actorName,
        pet: this.pet
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    const abilities = context.holders.abilities.getByParentId(this.id);
    for (const sg of abilities) {
      context.holders.abilities.remove([sg.id]);
    }
    // const job = context.holders.jobs.get(this.id);
    context.holders.jobs.remove([this.id]);

    // this.filter = job.filter;
    context.holders.bossTargets.initialBossTarget = this.prevBossTarget;

    context.update({ updateBossTargets: true, updateBossAttacks: true });
  }

  execute(context: ICommandExecutionContext): void {
    if (!this.id) {
      this.id = context.idGen.getNextId(EntryType.Job);
    }
    const job = context.jobRegistry.getJob(this.jobName);
    const abilityIds = [];
    let index = 0;

    const map = {
      id: this.id,
      job,
      actorName: this.actorName,
      isCompactView: context.isCompactView(),
      collapsed: this.collapsed
    };
    const jobMap = new JobMap(context.presenter, map.id, map.job, { actorName: map.actorName }, this.pet);


    if (job.stances && job.stances.length) {
      const nextId = this.id + "_" + index;
      abilityIds.push(new AbilityMap(
        context.presenter,
        nextId,
        jobMap,
        null,
        true,
        {}
      ));
      index++;
    }

    for (const a of Object.keys(job.abilities)) {
      const nextId = this.id + "_" + index;
      abilityIds.push(new AbilityMap(context.presenter, nextId, jobMap, a, false, {}));
      index++;
    }

    context.holders.jobs.add(jobMap);
    context.holders.abilities.addRange(abilityIds);


    if ((context.holders.bossTargets.initialBossTarget === undefined || context.holders.bossTargets.initialBossTarget === "boss")
      && map.job.role === Role.Tank) {
      context.holders.bossTargets.initialBossTarget = this.id;
    }

    if (this.doUpdates) {
      context.update({ updateBossTargets: true });
    }
  }
}
