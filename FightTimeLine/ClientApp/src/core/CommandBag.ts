import { Command, UndoRedoController } from "./UndoRedo";
import { CombinedCommand } from "./Commands";

export class CommandBag {
  private commandsBag: Command[] = [];
  private commandStorage: UndoRedoController;

  constructor(commandStorage: UndoRedoController) {
    this.commandStorage = commandStorage;
  }

  push(command: Command): void {
    this.commandsBag.push(command);
  }

  evaluate(): void {
    this.commandStorage.execute(new CombinedCommand(this.commandsBag));
    this.commandsBag = [];
  }

  clear(): void {
    this.commandsBag = [];
  }
}
