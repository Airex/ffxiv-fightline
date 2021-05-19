import { Pipe, PipeTransform } from '@angular/core';
import { IAbility, AbilityType } from 'src/core/Models';

type Input = {
  jobId: string;
  jobName: string;
  ability: IAbility;
  id: string;
}[]

@Pipe({
  name: 'soloparty',
  pure: false
})
export class SoloPartyPipe implements PipeTransform {
  transform(items: Input, filter: [boolean, boolean]): any {
    if (!items || !filter) {
      return items;
    }
    // filter items array, items which match and return true will be
    // kept, false will be filtered out
    return items.filter(item => (!item.ability ||
      (item.ability.abilityType & AbilityType.PartyDefense) === AbilityType.PartyDefense && filter[1] ||
      (item.ability.abilityType & AbilityType.PartyShield) === AbilityType.PartyShield && filter[1] ||
      (item.ability.abilityType & AbilityType.SelfDefense) === AbilityType.SelfDefense && filter[0] ||      
      (item.ability.abilityType & AbilityType.SelfShield) === AbilityType.SelfShield && filter[0] ||
      (item.ability.abilityType & AbilityType.TargetDefense) === AbilityType.TargetDefense && filter[0]
    ));
  }
}
