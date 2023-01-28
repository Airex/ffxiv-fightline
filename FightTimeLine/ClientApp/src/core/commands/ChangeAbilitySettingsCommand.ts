import { Command, ICommandExecutionContext, ICommandData } from "../UndoRedo";


export class ChangeAbilitySettingsCommand extends Command {
  private prevSettings: string;

  serialize(): ICommandData {
    return {
      name: "changeAbilitySettings",
      params: {
        id: this.id,
        newSettings: this.newSettings
      }
    };
  }

  constructor(private id: string, private newSettings: any) {
    super();
    this.newSettings = JSON.stringify(newSettings);
  }

  reverse(context: ICommandExecutionContext): void {
    const item = context.holders.itemUsages.get(this.id);
    item.settings = JSON.parse(this.prevSettings);

    context.holders.itemUsages.update([item]);

    context.update({ updateBossTargets: true });
  }

  execute(context: ICommandExecutionContext): void {
    const item = context.holders.itemUsages.get(this.id);
    this.prevSettings = JSON.stringify(item.settings);
    let settings = JSON.parse(this.newSettings);
    if (typeof settings === "string") {
      settings = JSON.parse(settings);
    }
    item.settings = settings;
    context.holders.itemUsages.update([item]);

    context.update({ updateBossTargets: true });
  }
}
