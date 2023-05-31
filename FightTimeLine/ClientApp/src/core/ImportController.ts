import * as UndoRedo from "./UndoRedo";
import * as SettingsService from "../services/SettingsService";
import * as FFLogsCollectors from "./FflogsCollectors/FFLogsCollectors";
import * as Generators from "./Generators";
import * as Commands from "./commands/Commands";
import * as AddJobCommand from "./commands/AddJobCommand";
import * as CombinedCommand from "./commands/CombinedCommand";
import * as Models from "./Models";

import * as Jobregistryserviceinterface from "../services/jobregistry.service-interface";
import * as Parser from "./Parser";
import { Holders } from "./Holders";
import { RemoveBossAttackCommand } from "./commands/RemoveBossAttackCommand";

export class ImportController {

  constructor(
    private idgen: Generators.IdGenerator,
    private holders: Holders,
    private jobRegistry: Jobregistryserviceinterface.IJobRegistryService) {
  }

  private addJob(
    id: string,
    name: string,
    actorName?: string,
    pet?: string,
    collapsed: boolean = false,
    doUpdates: boolean = true): UndoRedo.Command {
    return new AddJobCommand.AddJobCommand(id, name, actorName, this.holders.bossTargets.initialBossTarget, doUpdates, pet, collapsed);
  }

  buildImportCommand(settings: SettingsService.ISettings, parser: Parser.Parser): UndoRedo.Command {
    try {
      const commands: UndoRedo.Command[] = [];

      const defaultOrder = ["Tank", "Heal", "DD"];
      const sortOrder = settings.fflogsImport.sortOrderAfterImport;

      parser.players.sort((a, b) => sortOrder.indexOf(defaultOrder[a.role]) - sortOrder.indexOf(defaultOrder[b.role])).forEach(it => {
        it.rid = this.idgen.getNextId(Models.EntryType.Job);
        commands.push(this.addJob(it.rid, it.job, it.actorName, null, false, false));
      });

      const context: FFLogsCollectors.ICollectorContext = {
        parser,
        jobRegistry: this.jobRegistry,
        commands,
        settings,
        idgen: this.idgen
      };

      const collectors = [
        new FFLogsCollectors.AbilityUsagesCollector(context),
        new FFLogsCollectors.BossAttacksCollector(context),
      ];

      parser.processCollectors(collectors);


      return new CombinedCommand.CombinedCommand(commands);

    } catch (e) {
      console.error(e);
    }
  }

  buildImportBossAttacksCommand(settings: SettingsService.ISettings, parser: Parser.Parser): UndoRedo.Command {
    try {
      const commands: UndoRedo.Command[] = [];

      this.holders.bossAttacks.getAll().forEach(it => {
        commands.push(new RemoveBossAttackCommand(it.id, false));
      });

      const context: FFLogsCollectors.ICollectorContext = {
        parser,
        jobRegistry: this.jobRegistry,
        commands,
        settings,
        idgen: this.idgen
      };

      const collectors = [
        new FFLogsCollectors.BossAttacksCollector(context),
      ];

      parser.processCollectors(collectors);


      return new CombinedCommand.CombinedCommand(commands);

    } catch (e) {
      console.error(e);
    }
  }

}
