import { EventEmitter } from "@angular/core"
import { IdGenerator } from "./Generators"
import { IAbility, IPresenterData } from "./Models"
import * as Jobregistryserviceinterface from "../services/jobregistry.service-interface";
import * as Holders from "./Holders";
import * as Index from "./Maps/index";

export interface ICommandExecutionContext {
  idGen: IdGenerator;
  holders: Holders.Holders,
  jobRegistry: Jobregistryserviceinterface.IJobRegistryService;
  presenter: IPresenterData,
  update: (options: IUpdateOptions) => void;
  ogcdAttacksAsPoints: (ability: IAbility) => boolean;
  verticalBossAttacks: () => boolean;
  isCompactView: () => boolean;
  highlightLoaded: () => boolean;
  addTags: (t: string[]) => void;
  addSources: (s: string) => void;
}

export interface IUpdateOptions {
  abilityChanged?: Index.AbilityMap;
  updateIntersectedWithBossAttackAtDate?: Date | null;
  updateBossAttacks?: string[] | boolean;
  updateBossTargets?: boolean;
  updateDowntimeMarkers?: boolean;
  updateFilters?: boolean;
}

export class UndoRedoController {
  private undoCommands = new Array<Command>();
  private redoCommands = new Array<Command>();
  private context: ICommandExecutionContext;

  public changed = new EventEmitter<void>();
  public executed = new EventEmitter<ICommandData>();
  private fireExecuted = true;

  public turnOnFireExecuted() {
    this.fireExecuted = true;
  }

  public turnOffFireExecuted() {
    this.fireExecuted = false;
  }

  constructor(context: ICommandExecutionContext) {
    this.context = context;
  }

  

  public execute(command: Command, fireExecuted: boolean = true) {
    try {
      command.execute(this.getContext());
      this.undoCommands.push(command);
      delete this.redoCommands;
      this.redoCommands = new Array<Command>();
      this.changed.emit();
      if (fireExecuted && this.fireExecuted)
        this.executed.emit(command.serialize());
    } catch (error) {
      console.error(error);
      //console.log("Unable to execute command " + JSON.stringify(command.serialize()));
    }
  }

  public clear() {
    delete this.undoCommands;
    this.undoCommands = new Array<Command>();

    delete this.redoCommands;
    this.redoCommands = new Array<Command>();
    this.changed.emit();
  }

  public undo(): void {
    if (this.undoCommands.length === 0) return;
    const last = this.undoCommands.pop();
    last.reverse(this.getContext());
    this.redoCommands.push(last);
    this.changed.emit();
  }

  public redo(): void {
    if (this.redoCommands.length === 0) return;
    const last = this.redoCommands.pop();
    last.execute(this.getContext());
    this.undoCommands.push(last);
    this.changed.emit();
  }

  private getContext(): ICommandExecutionContext {
    return this.context;
  }

  public canUndo(): boolean {
    return this.undoCommands.length > 0;
  }

  public canRedo(): boolean {
    return this.redoCommands.length > 0;
  }
}

export interface ICommandData {
  name: string;
  params?: {
    [name: string]: any;
  }
}

export abstract class Command {
  abstract reverse(context: ICommandExecutionContext): void;
  abstract execute(context: ICommandExecutionContext): void;
  abstract serialize(): ICommandData;
}








