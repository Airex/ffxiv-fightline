import { IJob, Role } from "../../../Models"
import * as Fractions from "../fractions";

export const Gunslinger_Saboteur: IJob = {
  name: "Saboteur",
  role: Role.Range,
  fraction: Fractions.SWTORFractions.Republic,
  baseClass: "Gunslinger",
  icon: ("REPUBLIC/Gunslinger/Saboteur/!!!SpecIcon.jpg"),
  abilities: []
};
