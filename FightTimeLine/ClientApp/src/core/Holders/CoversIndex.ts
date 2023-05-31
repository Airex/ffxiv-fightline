import { Holders } from "../Holders";
import { addSeconds } from "../Utils";

type IndexStorage = {
  abilityToAttacks: Map<string, { id: string }[]>;
  attackToAbilities: Map<string, { id: string }[]>;
};

export class AttacksCoverageIndex {
  private storage: IndexStorage = {
    abilityToAttacks: new Map(),
    attackToAbilities: new Map(),
  };

  constructor(private holders: Holders) {}

  ability(id: string) {
    const ability = this.holders.itemUsages.get(id);
    const range = {
      start: ability.start,
      end: addSeconds(ability.start, ability.calculatedDuration),
    };
    const covered = this.holders.bossAttacks.filter((attack) => {
      return attack.start >= range.start && attack.start <= range.end;
    });
    this.storage.abilityToAttacks.set(id, covered);
  }

  attack(id: string) {
    const attack = this.holders.bossAttacks.get(id);
    const covered = this.holders.itemUsages.filter((ability) => {
      return ability.checkCoversDate(attack.start);
    });
    this.storage.attackToAbilities.set(id, covered);
  }

  getCoverageForAttack(id: string) {
    return this.storage.attackToAbilities.get(id);
  }

  getAttacksCoveredByAbility(id) {
    return this.storage.abilityToAttacks.get(id);
  }
}
