import { Command, ICommandExecutionContext, ICommandData } from "../UndoRedo";


export class SetJobPetCommand extends Command {
  private prevPet: string;

  constructor(private id: string, private pet: string) {
    super();
  }

  reverse(context: ICommandExecutionContext): void {
    const map = context.holders.jobs.get(this.id);
    map.pet = this.prevPet;

    context.update({ updateFilters: true });
  }

  execute(context: ICommandExecutionContext): void {
    const map = context.holders.jobs.get(this.id);
    this.prevPet = map.pet;
    map.pet = this.pet;

    context.update({ updateFilters: true });
  }

  serialize(): ICommandData {
    return {
      name: "setJobPet",
      params: {
        id: this.id,
        pet: this.pet
      }
    };
  }
}
