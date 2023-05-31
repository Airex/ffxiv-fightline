import { Command, ICommandData } from "./UndoRedo";
import { AttachPresetCommand } from "./commands/AttachPresetCommand";
import { MoveStanceCommand } from "./commands/MoveStanceCommand";
import { RemoveStanceCommand } from "./commands/RemoveStanceCommand";
import { AddStanceCommand } from "./commands/AddStanceCommand";
import { SetJobPetCommand } from "./commands/SetJobPetCommand";
import { RemoveDownTimeCommand } from "./commands/RemoveDownTimeCommand";
import { ChangeDowntimeCommentCommand } from "./commands/ChangeDowntimeCommentCommand";
import { ChangeDowntimeColorCommand } from "./commands/ChangeDowntimeColorCommand";
import { ChangeDowntimeCommand } from "./commands/ChangeDowntimeCommand";
import { AddDowntimeCommand } from "./commands/AddDowntimeCommand";
import { ChangeAbilitySettingsCommand } from "./commands/ChangeAbilitySettingsCommand";
import { ChangeJobStats } from "./commands/ChangeJobStats";
import { SwitchTargetCommand } from "./commands/SwitchTargetCommand";
import { RemoveAbilityCommand } from "./commands/RemoveAbilityCommand";
import { AddAbilityCommand } from "./commands/AddAbilityCommand";
import { AddBatchUsagesCommand } from "./commands/AddBatchUsagesCommand";
import { AddBatchAttacksCommand } from "./commands/AddBatchAttacksCommand";
import { MoveCommand } from "./commands/MoveCommand";
import { ChangeBossAttackCommand } from "./commands/ChangeBossAttackCommand";
import { RemoveBossAttackCommand } from "./commands/RemoveBossAttackCommand";
import { AddBossAttackCommand } from "./commands/AddBossAttackCommand";
import { RemoveJobCommand } from "./commands/RemoveJobCommand";
import { AddJobCommand } from "./commands/AddJobCommand";
import { CombinedCommand } from "./commands/CombinedCommand";
import { IView, IBossAbility } from "./Models";
import { Utils, startOffsetConst } from "./Utils";

export class CommandFactory {
  constructor() {

  }
  createFromData(data: ICommandData, view: IView): Command {
    if (!data) { return null; }
    switch (data.name) {
      case "useAbility":
        return new AddAbilityCommand(
          data.params.id,
          data.params.jobActor,
          data.params.jobGroup,
          data.params.abilityName,
          Utils.getDateFromOffset(data.params.time),
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
          Utils.getDateFromOffset(data.params.moveTo));
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
            start: Utils.getDateFromOffset(data.params.start),
            startId: null,
            end: Utils.getDateFromOffset(data.params.end),
            endId: null
          },
          data.params.color,
          data.params.comment
        );
      case "removeDowntime":
        return new RemoveDownTimeCommand(
          data.params.id);
      case "changeDowntime":
        return new ChangeDowntimeCommand(
          data.params.id,
          Utils.getDateFromOffset(data.params.start),
          Utils.getDateFromOffset(data.params.end)
        );
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
          Utils.getDateFromOffset(data.params.start),
          Utils.getDateFromOffset(data.params.end),
          data.params.loaded);
      case "removeStance":
        return new RemoveStanceCommand(
          data.params.id,
          data.params.updateBossAttacks);
      case "moveStance":
        return new MoveStanceCommand(
          data.params.id,
          Utils.getDateFromOffset(data.params.moveStartTo),
          Utils.getDateFromOffset(data.params.moveEndTo));
      case "changeJobStats":
        return new ChangeJobStats(
          data.params.id,
          JSON.parse(data.params.newData)
        );
      case "attachPreset":
        return new AttachPresetCommand(
          data.params.id,
          data.params.preset
        );
      default:
    }
    return null;
  }
}
