import * as FF from "./FFLogs"
import * as M from "./Models"
import { Utils } from "./Utils"

export interface IProcessingContext {

}

abstract class Base {
  constructor(val: any) {
    if (val) {
      for (var v in val) {
        if (val.hasOwnProperty(v)) {
          this[v] = val[v];
        }
      }
    }
  }
  abstract process(event: FF.AbilityEvent, context: IProcessingContext): boolean;
}

type Builders = {
  [name: string]: () => Base;
}

const compare = (name: string, a1: number, a2: number): boolean => {
  const cmps = {
    "<": (a1: number, a2: number) => a1 < a2,
    "<=": (a1: number, a2: number) => a1 <= a2,
    ">": (a1: number, a2: number) => a1 > a2,
    ">=": (a1: number, a2: number) => a1 >= a2,
    "==": (a1: number, a2: number) => a1 === a2,
    "<>": (a1: number, a2: number) => a1 !== a2,
  }
  return cmps[name](a1, a2);
}

class Count extends Base {

  count: number;
  countComparer: string;
  counter: number = 0;
  name: string;

  process(event: FF.AbilityEvent, context: IProcessingContext):boolean {
    if (event.ability.name === this.name)
      ++this.counter;
    return compare(this.countComparer, this.count, this.counter);
  }

  constructor(val: any) {
    super(val);
  }
}

class Time extends Base {
  process(event: FF.AbilityEvent, context: IProcessingContext) {
    return false;
  }

  constructor(val: any) {
    super(val);
  }
}

class Hp extends Base {
  process(event: FF.AbilityEvent, context: IProcessingContext) {
    return false;
  }

  constructor(val: any) {
    super(val);
  }
}

class HpPercent extends Base {
  process(event: FF.AbilityEvent, context: IProcessingContext) {
    return false;
  }

  constructor(val: any) {
    super(val);
  }
}

class Type extends Base {

  entryType: string;

  process(event: FF.AbilityEvent, context: IProcessingContext) {
    return event && event.type === this.entryType;
  }

  constructor(val: any) {
    super(val);
  }
}

class Name extends Base {

  name: string;

  process(event: FF.AbilityEvent, context: IProcessingContext) {
    return event && event.ability && event.ability.name === this.name;
  }

  constructor(val: any) {
    super(val);
  }
}

const buildNode = (data: M.Combined): IExpressionNode<FF.AbilityEvent> => {
  if (M.isSettingGroup(data)) {
    if (data.operation === M.SyncOperation.And)
      return new AndNode(data.operands.map(d => buildNode(d)));
    else
      return new OrNode(data.operands.map(d => buildNode(d)));
  }
  if (M.isSetting(data)) {
    return new CalculableNode(factory(data.type, data.payload));
  }
  return null;
}


const buildTree = (data: M.ISyncData): IExpressionTree<FF.AbilityEvent> => {
  return {
    root: buildNode(data.condition)
  };
}


export const process = (data: FF.AbilityEvent[], startTime: number, attacks: M.IBossAbility[]): M.IBossAbility[] => {
  const buildSettings = (root: M.ISyncData, time: string) => {
    return <IUnit<FF.AbilityEvent>>{
      name: "",
      offset: Utils.getDateFromOffset(root.offset).valueOf() as number,
      time: Utils.getDateFromOffset(time).valueOf() as number,
      tree: buildTree(root)
    };
  };

  //find attacks with settings
  const withSettings = attacks.filter(c => !!c.syncSettings).map(c => {
    const s = JSON.parse(c.syncSettings) as M.ISyncData;
    return buildSettings(s, c.offset);
  });

  const windows: Window[] = [];

  const context = {}

  //build windowsB
  data.forEach(d => {
    withSettings.forEach(ws => {
      const value = ws.tree.root.value(d, context);
      if (value) {
        const prevOffsets = windows.map(v => v.end - v.start).reduce((acc, val) => acc + val, 0);
        windows.push({ start: (d.timestamp - startTime) + ws.offset + prevOffsets, end: ws.time });
      }
    });
  });

  //filter by windows
  const result = attacks.filter(it => {
    const offset = Utils.getDateFromOffset(it.offset).valueOf();
    return !windows.some((w => offset >= w.start && offset < w.end) as any);
  });


  //fixup offsets
  result.forEach(it => {
    const offset = Utils.getDateFromOffset(it.offset).valueOf();
    const total = windows.filter(w => w.end <= offset).map(v => v.end - v.start).reduce((acc, val) => acc + val, 0);
    it.offset = Utils.formatTime(new Date(offset - total));
  });

  return result;
}

interface Window {
  start: number;
  end: number;
}

interface IUnit<TData> {
  tree: IExpressionTree<TData> | null;
  name: string;
  time: number,
  offset: number;
}

interface IExpressionTree<TData> {
  root: IExpressionNode<TData>;
}

interface IExpressionNode<TData> {
  value: (data: TData, context: IProcessingContext) => boolean;
  nodes: IExpressionNode<TData>[];
}


class AndNode implements IExpressionNode<FF.AbilityEvent> {

  constructor(nodes: IExpressionNode<FF.AbilityEvent>[]) {
    this.nodes = nodes;
  }
  value(data: FF.AbilityEvent, context: IProcessingContext): boolean {
    return this.nodes && this.nodes.every((n => n.value(data)) as any);
  }

  nodes: IExpressionNode<FF.AbilityEvent>[];
}

class OrNode implements IExpressionNode<FF.AbilityEvent> {

  constructor(nodes: IExpressionNode<FF.AbilityEvent>[]) {
    this.nodes = nodes;
  }

  value(data: FF.AbilityEvent, context: IProcessingContext): boolean {
    return this.nodes && this.nodes.some((n => n.value(data)) as any);
  }

  nodes: IExpressionNode<FF.AbilityEvent>[];
}

class CalculableNode implements IExpressionNode<FF.AbilityEvent> {

  constructor(private unit: Base) { }
  value(data: FF.AbilityEvent, context: IProcessingContext): boolean {
    return this.unit.process(data, context);
  }

  nodes: IExpressionNode<FF.AbilityEvent>[];
}


export function factory(name: string, foo: any): Base {
  const b: Builders = {
    "count": () => new Count(foo),
    "type": () => new Type(foo),
    "hp": () => new Hp(foo),
    "hpPercent": () => new HpPercent(foo),
    "time": () => new Time(foo),
    "name": () => new Name(foo)
  };
  const r = b[name]();
  return r;
};
