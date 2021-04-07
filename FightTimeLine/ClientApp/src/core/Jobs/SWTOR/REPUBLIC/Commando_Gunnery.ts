import { IJob, Role } from "../../../Models"
import * as Fractions from "../fractions";

export const Commando_Combat_Gunnery: IJob = {
  name: "Gunnery",
  role: Role.Melee,
  fraction: Fractions.SWTORFractions.Republic,
  baseClass: "Commando",
  icon: ("REPUBLIC/Commando/Gunnery/!!!SpecIcon.jpg"),
  abilities: []
};
