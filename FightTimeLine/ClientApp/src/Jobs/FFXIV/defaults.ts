import { IJobStats, Role } from "../../core/Models";

export const DefaultRoleStats: Record<Role, IJobStats> = {
  [Role.Tank]: {
    attackMagicPotency: 2900,
    weaponDamage: 126,
    criticalHit: 0,
    determination: 1806,
    tenacity: 615,
    directHit: 0,
    hp: 102637,
  },
  [Role.Healer]: {
    attackMagicPotency: 2945,
    weaponDamage: 126,
    criticalHit: 0,
    determination: 1620,
    directHit: 0,
    hp: 65042,
  },
  [Role.Caster]: {
    attackMagicPotency: 2945,
    weaponDamage: 126,
    criticalHit: 0,
    determination: 1382,
    directHit: 0,
    hp: 65042,
  },
  [Role.Range]: {
    attackMagicPotency: 2949,
    weaponDamage: 126,
    criticalHit: 0,
    determination: 1721,
    directHit: 0,
    hp: 71603,
  },
  [Role.Melee]: {
    attackMagicPotency: 2921,
    weaponDamage: 126,
    criticalHit: 0,
    determination: 1669,
    tenacity: 615,
    directHit: 0,
    hp: 71425,
  },
};

export const DefaultJobStats : Record<string, IJobStats> = {

}
