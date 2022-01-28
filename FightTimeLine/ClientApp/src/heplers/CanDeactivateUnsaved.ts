import { Injectable }    from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { FightLineComponent } from "../fightline/fightline.component";


@Injectable({
  providedIn: 'root',
})
export class CanDeactivateUnsaved implements CanDeactivate<FightLineComponent> {
  canDeactivate(component: FightLineComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
  {

    return component && !component.hasChanges || confirm("There are unsaved changes. Are you sure you want to leave?");
  }
}
