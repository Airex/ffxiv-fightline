import { IJob, Role } from "../../../Models"
import * as Fractions from "../fractions";

export const Scoundrel_Sawbones: IJob = {
  name: "Sawbones",
  role: Role.Healer,
  fraction: Fractions.SWTORFractions.Republic,
  baseClass: "Scoundrel",
  icon: ("REPUBLIC/Scoundrel/Sawbones/!!!SpecIcon.jpg"),
  abilities: []
};
