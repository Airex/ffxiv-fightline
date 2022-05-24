import { Injectable } from '@angular/core';
import { Subject, Observable } from "rxjs";
import { IBoss, IJobStats } from 'src/core/Models';

export type DialogClose = {
  close: () => void
};

export type DispatcherPayloads = {
  updateSettings: void,
  changeJobStats: {
    id: string,
    data: IJobStats
  },
  similarClick: string,
  similarAllClick: string[],
  abilityClick: string,
  bossTemplateSave: DialogClose & {
    name: string,
    reference: number,
    isPrivate: boolean
  },
  bossTemplateSaveAsNew: DialogClose & {
    name: string,
    reference: number,
    isPrivate: boolean
  },
  bossTemplatesLoad: DialogClose & {
    boss: IBoss,
    encounter: number
  },
  removeJob: string,
  toggleAttackPin: string,
  attackCopy: string[],
  attackEdit: string,
  updateFilter: void,
  updateView: void,
  abilitySaveSettings: {
    id: string,
    settings: any
  },
  hideJobAbility: string,
  clearJobAbility: string,
  fillJobAbility: string,
  fillJob: string,
  jobAbilityRestoreAll: string,
  jobAbilityRestore: string,
  toggleJobCompactView: string,
  toggleJobAbilityCompactView: string,
  downTimeColor: {
    id: string,
    color: string
  },
  downtimeComment: {
    id: string,
    comment: string
  },
  abilitiesRemove: string[],
  attacksRemove: string[],
  downtimeRemove: string,
  selectDowntimes: string
};

// // oh boy don't do this
// type UnionToIntersection<U> =
//   (U extends any
//     ? (k: U) => void
//     : never) extends ((k: infer I) => void) ? I : never

// type LastOf<T> =
//   UnionToIntersection<T extends any ? () => T : never> extends () => (infer R) ? R : never

// // TS4.0+
// type Push<T extends any[], V> = [...T, V];

// type TuplifyUnion<T, L = LastOf<T>, N = [T] extends [never] ? true : false> =
//   true extends N ? [] : Push<TuplifyUnion<Exclude<T, L>>, L>

// type ObjValueTuple<T, KS extends any[] = TuplifyUnion<keyof T>, R extends any[] = []> =
//   KS extends [infer K, ...infer KT]
//   ? ObjValueTuple<T, KT, [...R, T[K & keyof T]]>
//   : R

// type WithKeysAsMethods<T> = { [f in keyof T]: (...input: ObjValueTuple<T[f]>) => void }
// type C = WithKeysAsMethods<DispatcherPayloads>;

// class F {
//   process() {
//     let d: C = {} as any;
//     // хочу чтобы метод ниже имел сигнатуру (arg1: string, arg2: number)
//     d.updateFilter()

//   }
// }


@Injectable()
export class DispatcherService<T> {
  constructor() {

  }

  subs: Subject<any>[] = [];

  private dispatcher: Subject<{ name: string, payload: any }> = new Subject<{ name: string, payload: any }>();

  on<U extends keyof T>(name: U): Observable<T[U]> {
    const result = new Subject<T[U]>();
    this.dispatcher.subscribe(cmd => {
      if (cmd.name === name) {
        result.next(cmd.payload);
      }
    });
    this.subs.push(result);

    return result;
  }

  dispatch<U extends keyof DispatcherPayloads>(name: U, payload?: DispatcherPayloads[U]) {
    this.dispatcher.next({ name, payload });
  }

  destroy() {
    this.subs.forEach(e => e.unsubscribe());
    this.subs = [];
  }
}
