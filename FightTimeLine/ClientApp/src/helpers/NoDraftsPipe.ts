import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nodrafts',
  pure: false
})
export class NoDraftsPipe implements PipeTransform {
  transform(items: any[], filter: boolean): any {
    if (!items || filter) {
      return items;
    }
    // filter items array, items which match and return true will be
    // kept, false will be filtered out
    return items.filter(item => (!item.isDraft));
  }
}
