import { IJob, Role } from "../../../Models"
import * as Fractions from "../fractions";

export const Commando_Assault_Specialist: IJob = {
  name: "Assault Specialist",
  role: Role.Melee,
  fraction: Fractions.SWTORFractions.Republic,
  baseClass: "Commando",
  icon: ("REPUBLIC/Commando/Assault Specialist/!!!SpecIcon.jpg"),
  abilities: []
};
