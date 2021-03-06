import * as UndoRedo from "./UndoRedo";
import * as SettingsService from "../services/SettingsService";
import * as FFLogsCollectors from "./FflogsCollectors/FFLogsCollectors";
import * as Generators from "./Generators";
import * as Commands from "./Commands";
import * as Models from "./Models";

import * as Jobregistryserviceinterface from "../services/jobregistry.service-interface";
import * as Parser from "./Parser";
import {Holders} from "./Holders";

export class ImportController {

  constructor(
    private idgen: Generators.IdGenerator,
    private holders: Holders,
    private jobRegistry: Jobregistryserviceinterface.IJobRegistryService) {

  }

  private addJob(id: string, name: string, actorName?: string, pet?: string, collapsed: boolean = false, doUpdates: boolean = true): UndoRedo.Command {
    return new Commands.AddJobCommand(id, name, actorName, this.holders.bossTargets.initialBossTarget, doUpdates, pet, collapsed);
  }

  buildImportCommand(settings: SettingsService.ISettings, parser: Parser.Parser, startDate: Date, ): UndoRedo.Command {
    try {
      const commands: UndoRedo.Command[] = [];

      const defaultOrder = ["Tank", "Heal", "DD"];
      const sortOrder = settings.fflogsImport.sortOrderAfterImport;

      parser.players.sort((a, b) => sortOrder.indexOf(defaultOrder[a.role]) - sortOrder.indexOf(defaultOrder[b.role])).forEach(it => {
        it.rid = this.idgen.getNextId(Models.EntryType.Job);
        commands.push(this.addJob(it.rid, it.job, it.actorName, null, false, false));
      });

      const context: FFLogsCollectors.ICollectorContext = {
        parser: parser,
        jobRegistry: this.jobRegistry,
        commands: commands,
        settings: settings,
        idgen: this.idgen
      }

      const collectors = [
        new FFLogsCollectors.AbilityUsagesCollector(context),
        new FFLogsCollectors.BossAttacksCollector(context),
//        new FFLogsCollectors.JobPetCollector(this.holders.jobs, this.holders.abilities, this.commandStorage, this.idgen, this.startDate),
//        new FFLogsCollectors.StancesCollector(this.holders.jobs, this.holders.abilities, this.commandStorage, this.idgen, this.startDate)
      ];

      parser.processCollectors(collectors);
      

      return new Commands.CombinedCommand(commands);

    } catch (e) {
      console.error(e);
    }
  }
  
}
