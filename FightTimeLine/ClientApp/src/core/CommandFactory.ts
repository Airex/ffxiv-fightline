import { Command, ICommandData } from "./UndoRedo"
import {
  AddAbilityCommand, RemoveAbilityCommand, MoveCommand, AddJobCommand, CombinedCommand, AddBossAttackCommand, RemoveBossAttackCommand, ChangeAbilitySettingsCommand,
  SwitchTargetCommand, ChangeBossAttackCommand, RemoveJobCommand, AddDowntimeCommand, RemoveDownTimeCommand, ChangeDowntimeCommand, ChangeDowntimeColorCommand, SetJobPetCommand,
  AddStanceCommand, RemoveStanceCommand, MoveStanceCommand,
  AddBatchUsagesCommand,
  AddBatchAttacksCommand,
  ChangeDowntimeCommentCommand,
  ChangeJobStats
} from "./Commands"
import { IView, IBossAbility } from "./Models"
import { Utils } from "./Utils"

export class CommandFactory {
  constructor(private startDate: Date) {

  }
  createFromData(data: ICommandData, view: IView): Command {
    if (!data) return null;
    switch (data.name) {
      case "useAbility":
        return new AddAbilityCommand(
          data.params.id,
          data.params.jobActor,
          data.params.jobGroup,
          data.params.abilityName,
          Utils.getDateFromOffset(data.params.time, this.startDate),
          data.params.loaded,
          data.params.settings);
      case "useAbilityBatch":
        return new AddBatchUsagesCommand(
          data.params.commands.map(it => {
            return this.createFromData({
              name: "useAbility",
              params: it
            }, view);
          }));
      case "addBossAttackBatch":
        return new AddBatchAttacksCommand(
          data.params.commands.map(it => {
            return this.createFromData({
              name: "addBossAttack",
              params: it
            }, view);
          }));
      case "removeAbility":
        return new RemoveAbilityCommand(
          data.params.id,
          data.params.updateBossAttacks);
      case "moveAbility":
        return new MoveCommand(
          data.params.id,
          Utils.getDateFromOffset(data.params.moveTo, this.startDate));
      case "changeAbilitySettings":
        return new ChangeAbilitySettingsCommand(
          data.params.id,
          data.params.newSettings);
      case "addBossAttack":
        return new AddBossAttackCommand(
          data.params.id,
          data.params.attack as IBossAbility);
      case "removeBossAttack":
        return new RemoveBossAttackCommand(
          data.params.id,
          data.params.updateAttacks);
      case "changeBossAttack":
        return new ChangeBossAttackCommand(
          data.params.id,
          data.params.attack as IBossAbility,
          data.params.updateAllWithSameName);
      case "addJob":
        return new AddJobCommand(data.params.id,
          data.params.jobName,
          data.params.actorName,
          data.params.prevBossTarget,
          data.params.doUpdates,
          data.params.pet,
          false);
      case "removeJob":
        return new RemoveJobCommand(
          data.params.id);
      case "combined":
        return new CombinedCommand(
          data.params.commands.map((it: ICommandData) => this.createFromData(it, view)));
      case "switchTarget":
        return new SwitchTargetCommand(
          data.params.prevTarget,
          data.params.newTarget);
      case "addDowntime":
        return new AddDowntimeCommand(
          data.params.id,
          {
            start: Utils.getDateFromOffset(data.params.start, this.startDate),
            startId: null,
            end: Utils.getDateFromOffset(data.params.end, this.startDate),
            endId: null
          }, data.params.color, data.params.comment);
      case "removeDowntime":
        return new RemoveDownTimeCommand(
          data.params.id);
      case "changeDowntime":
        return new ChangeDowntimeCommand(
          data.params.id,
          Utils.getDateFromOffset(data.params.start, this.startDate),
          Utils.getDateFromOffset(data.params.end, this.startDate));
      case "changeDowntimeColor":
        return new ChangeDowntimeColorCommand(
          data.params.id,
          data.params.newColor);
      case "changeDowntimeComment":
        return new ChangeDowntimeCommentCommand(
          data.params.id,
          data.params.newComment);
      case "setJobPet":
        return new SetJobPetCommand(
          data.params.id,
          data.params.pet);
      case "addStance":
        return new AddStanceCommand(
          data.params.id,
          data.params.jobGroup,
          data.params.abilityName,
          Utils.getDateFromOffset(data.params.start, this.startDate),
          Utils.getDateFromOffset(data.params.end, this.startDate),
          data.params.loaded);
      case "removeStance":
        return new RemoveStanceCommand(
          data.params.id,
          data.params.updateBossAttacks);
      case "moveStance":
        return new MoveStanceCommand(
          data.params.id,
          Utils.getDateFromOffset(data.params.moveStartTo, this.startDate),
          Utils.getDateFromOffset(data.params.moveEndTo, this.startDate));
      case "changeJobStats":
        return new ChangeJobStats(
          data.params.id,
          data.params.newData
        );

      default:
    }
    return null;
  }
}
