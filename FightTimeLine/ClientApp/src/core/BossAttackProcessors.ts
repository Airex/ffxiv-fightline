import * as FF from "./FFLogs"
import * as M from "./Models"
import { Utils } from "./Utils"


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
  abstract process(event: any);
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

  process(event) {
    ++this.counter;
    return compare(this.countComparer, this.count, this.counter);
  }

  constructor(val: any) {
    super(val);
  }
}

class Time extends Base {
  process(event) {

  }

  constructor(val: any) {
    super(val);
  }
}

class Hp extends Base {
  process(event) {

  }

  constructor(val: any) {
    super(val);
  }
}

class Type extends Base {

  entryType: string;

  process(event) {
    return event && event.type === this.entryType;
  }

  constructor(val: any) {
    super(val);
  }
}

class Name extends Base {

  name: string;

  process(event) {
    return event && event.ability && event.ability.name === this.name;
  }

  constructor(val: any) {
    super(val);
  }
}

const buildNode = <TData>(data: M.Combined): IExpressionNode<TData> => {
  if (M.isSettingGroup(data)) {
    if (data.operation === M.SyncOperation.And)
      return new AndNode<TData>(data.operands.map(d => buildNode(d)));
    else
      return new OrNode<TData>(data.operands.map(d => buildNode(d)));
  }
  if (M.isSetting(data)) {
    return new CalculableNode<TData>(factory(data.type, data.payload));
  }
  return null;
}


const buildTree = <TData>(data: M.ISyncData): IExpressionTree<TData> => {
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
      tree: buildTree<FF.AbilityEvent>(root)
    };
  };

  //find attacks with settings
  const withSettings = attacks.filter(c => !!c.syncSettings).map(c => {
    const s = JSON.parse(c.syncSettings) as M.ISyncData;
    return buildSettings(s, c.offset);
  });

  const windows: Window[] = [];

  //build windowsB
  data.forEach(d => {
    withSettings.forEach(ws => {
      const value = ws.tree.root.value(d);
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
  value: (data: TData) => boolean;
  nodes: IExpressionNode<TData>[];
}


class AndNode<TData> implements IExpressionNode<TData> {

  constructor(nodes: IExpressionNode<TData>[]) {
    this.nodes = nodes;
  }
  value(data: TData): boolean {
    return this.nodes && this.nodes.every((n => n.value(data)) as any);
  }

  nodes: IExpressionNode<TData>[];
}

class OrNode<TData> implements IExpressionNode<TData> {

  constructor(nodes: IExpressionNode<TData>[]) {
    this.nodes = nodes;
  }

  value(data: TData): boolean {
    return this.nodes && this.nodes.some((n => n.value(data)) as any);
  }

  nodes: IExpressionNode<TData>[];
}

class CalculableNode<TData> implements IExpressionNode<TData> {

  constructor(private unit: Base) { }
  value(data: TData): boolean {
    return this.unit.process(data);
  }

  nodes: IExpressionNode<TData>[];
}


export function factory(name: string, foo: any): Base {
  const b: Builders = {
    "count": () => new Count(foo),
    "type": () => new Type(foo),
    "hp": () => new Hp(foo),
    "time": () => new Time(foo),
    "name": () => new Name(foo)
  };
  const r = b[name]();
  return r;
};
