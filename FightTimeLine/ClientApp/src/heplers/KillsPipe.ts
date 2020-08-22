import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'killsonly',
  pure: false
})
export class KillsOnlyPipe implements PipeTransform {
  transform(items: any[], filter: any): any {
    if (!items || !filter) {
      return items;
    }
    // filter items array, items which match and return true will be
    // kept, false will be filtered out
    return items.filter(item => (item.kill && filter) || !filter);
  }
}
