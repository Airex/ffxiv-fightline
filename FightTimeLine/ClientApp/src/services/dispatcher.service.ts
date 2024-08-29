import { Injectable } from "@angular/core";
import { Subject, Observable } from "rxjs";
import { AbilityMap, AbilityUsageMap } from "../core/Maps";
import { IBoss, IJobStats } from "../core/Models";

export type DialogClose = {
  close: () => void;
};

export type DispatcherPayloads = {
  updateSettings: void;
  changeJobStats: {
    id: string;
    data: IJobStats;
  };
  similarClick: string;
  similarAllClick: string[];
  abilityClick: string;
  availAbilityClick: {
    abilityMap: AbilityMap;
    attackId: string;
  };
  bossTemplateSave: DialogClose & {
    name: string;
    reference: number;
    isPrivate: boolean;
  };
  bossTemplateSaveAsNew: DialogClose & {
    name: string;
    reference: number;
    isPrivate: boolean;
  };
  bossTemplatesLoad: DialogClose & {
    boss: IBoss;
    encounter: number;
  };
  removeJob: string;
  toggleAttackPin: string;
  attackCopy: string[];
  attackEdit: string;
  attacksSetColor:{
    ids: string[],
    color: string
  }
  updateFilter: void;
  updateView: void;
  abilitySaveSettings: {
    id: string;
    settings: any;
  };
  hideJobAbility: string;
  clearJobAbility: string;
  fillJobAbility: string;
  fillJob: string;
  jobAbilityRestoreAll: string;
  jobAbilityRestore: string;
  toggleJobCompactView: string;
  toggleJobAbilityCompactView: string;
  downTimeColor: {
    id: string;
    color: string;
  };
  downtimeComment: {
    id: string;
    comment: string;
  };
  abilitiesRemove: string[];
  attacksRemove: string[];
  downtimeRemove: string;
  selectDowntimes: string;
};

@Injectable()
export class DispatcherService<T> {
  constructor() {}

  subs: Subject<any>[] = [];

  private dispatcher: Subject<{ name: string; payload: any }> = new Subject<{
    name: string;
    payload: any;
  }>();

  on<U extends keyof T>(name: U): Observable<T[U]> {
    const result = new Subject<T[U]>();
    this.dispatcher.subscribe((cmd) => {
      if (cmd.name === name) {
        result.next(cmd.payload);
      }
    });
    this.subs.push(result);

    return result;
  }

  dispatch<U extends keyof DispatcherPayloads>(
    name: U,
    payload?: DispatcherPayloads[U]
  ) {
    this.dispatcher.next({ name, payload });
  }

  destroy() {
    this.subs.forEach((e) => e.unsubscribe());
    this.subs = [];
  }
}
