import { Pipe, PipeTransform } from '@angular/core';
import { Role, IJob } from 'src/core/Models';


@Pipe({
  name: 'jobrole',
  pure: false
})
export class JobRolePipe implements PipeTransform {
  transform(items: IJob[], filter: Role): IJob[] {
    if (!items) {
      return items;
    }
    const result = items.filter(item => item.role === filter);
    // filter items array, items which match and return true will be
    // kept, false will be filtered out
    return result;
  }
}
