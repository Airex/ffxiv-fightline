import * as FF from "./FFLogs";
import * as M from "./Models";
import { Utils } from "./Utils";
import { IDowntimeSerializeData } from "./SerializeController";

export interface IProcessingContext {
  startTime: number;
  count(name: string): number;
}


class ProcessingContext implements IProcessingContext {
  constructor(public startTime: number) { return; }

  counter: { [name: string]: number } = {};

  count(name: string): number {
    return this.counter[name];
  }

  countMe(name: string) {
    this.counter[name] = (this.counter[name] || 0) + 1;
  }
}

abstract class Base {
  constructor(val: any) {
    if (val) {
      for (const v in val) {
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
};

const compare = (name: string, a1: number, a2: number): boolean => {
  const cmps = {
    l: (a1: number, a2: number) => a1 < a2,
    le: (a1: number, a2: number) => a1 <= a2,
    g: (a1: number, a2: number) => a1 > a2,
    ge: (a1: number, a2: number) => a1 >= a2,
    e: (a1: number, a2: number) => a1 === a2,
    ne: (a1: number, a2: number) => a1 !== a2,
  };
  return cmps[name](a1, a2);
};

class Count extends Base {
  count: number;
  countComparer: string;
  name: string;

  process(event: FF.AbilityEvent, context: IProcessingContext): boolean {
    const counter = context.count(this.name);
    return compare(this.countComparer, counter, this.count);
  }

  constructor(val: any) {
    super(val);
  }
}

class Time extends Base {
  offset: number;
  offsetComparer: string;

  process(event: FF.AbilityEvent, context: IProcessingContext) {
    return compare(
      this.offsetComparer,
      Utils.getDateFromOffset(this.offset).valueOf() - context.startTime,
      event.timestamp - context.startTime);
  }

  constructor(val: any) {
    super(val);
  }
}

class Hp extends Base {
  count: number;
  countComparer: string;

  process(event: FF.AbilityEvent, context: IProcessingContext) {
    return compare(this.countComparer, (event as any).bossHp, this.count);
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
    if (data.operation === M.SyncOperation.And) {
      return new AndNode(data.operands.map(d => buildNode(d)));
    }
    else {
      return new OrNode(data.operands.map(d => buildNode(d)));
    }
  }
  if (M.isSetting(data)) {
    return new CalculableNode(factory(data.type, data.payload));
  }
  return null;
};


const buildTree = (data: M.ISyncData): IExpressionTree<FF.AbilityEvent> => {
  return {
    root: buildNode(data.condition)
  };
};


export const process = (
  fflogsData: FF.AbilityEvent[],
  startTime: number,
  attacks: M.IBossAbility[],
  downtimes: IDowntimeSerializeData[]): M.IBossAbility[] => {
  const buildSettings = (root: M.ISyncData, time: string) => {
    return {
      name: "",
      offset: Utils.getDateFromOffset(root.offset || "0:0").valueOf() as number,
      time: Utils.getDateFromOffset(time).valueOf() as number,
      tree: buildTree(root)
    } as IUnit<FF.AbilityEvent>;
  };

  const context = new ProcessingContext(startTime);

  // find attacks with settings
  const withSettings = attacks
    .filter(c => !!c.syncSettings)
    .map(c => {
      const s = JSON.parse(c.syncSettings) as M.ISyncData;
      return buildSettings(s, c.offset);
    });

  const windows: Window[] = [];

  // build windowsB
  fflogsData.forEach(d => {
    context.countMe(d.ability.name);
    withSettings.forEach(ws => {
      const value = ws.tree.root.value(d, context);
      if (value) {
        const prevOffsets = windows.map(v => v.end - v.start).reduce((acc, val) => acc + val, 0);
        windows.push({ start: (d.timestamp - startTime) + ws.offset + prevOffsets, end: ws.time });
      }
    });
  });

  // filter by windows
  const result = attacks.filter(it => {
    const offset = Utils.getDateFromOffset(it.offset).valueOf();
    return !windows.some((w => offset >= w.start && offset < w.end) as any);
  });


  // fixup offsets
  result.forEach(it => {
    const offset = Utils.getDateFromOffset(it.offset).valueOf();
    const total = windows.filter(w => w.end <= offset).map(v => v.end - v.start).reduce((acc, val) => acc + val, 0);
    it.offset = Utils.formatTime(new Date(offset - total));

    if (it.syncDowntime) {
      const found = downtimes.find(d => d.id === it.syncDowntime);
      if (found) {
        found.start = Utils.formatTime(new Date(Utils.getDateFromOffset(found.start).valueOf() - total));
        found.end = Utils.formatTime(new Date(Utils.getDateFromOffset(found.end).valueOf() - total));
      }
    }
    if (it.syncPreDowntime) {
      const found = downtimes.find(d => d.id === it.syncPreDowntime);
      if (found) {
        found.end = Utils.formatTime(new Date(Utils.getDateFromOffset(found.end).valueOf() - total));
      }
    }
  });




  return result;
};

interface Window {
  start: number;
  end: number;
}

interface IUnit<TData> {
  tree: IExpressionTree<TData> | null;
  name: string;
  time: number;
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
  nodes: IExpressionNode<FF.AbilityEvent>[];

  constructor(nodes: IExpressionNode<FF.AbilityEvent>[]) {
    this.nodes = nodes;
  }
  value(data: FF.AbilityEvent, context: IProcessingContext): boolean {
    return this.nodes && this.nodes.every(((n: IExpressionNode<FF.AbilityEvent>) => n.value(data, context)));
  }
}

class OrNode implements IExpressionNode<FF.AbilityEvent> {
  nodes: IExpressionNode<FF.AbilityEvent>[];

  constructor(nodes: IExpressionNode<FF.AbilityEvent>[]) {
    this.nodes = nodes;
  }

  value(data: FF.AbilityEvent, context: IProcessingContext): boolean {
    return this.nodes && this.nodes.some(((n: IExpressionNode<FF.AbilityEvent>) => n.value(data, context)));
  }
}

class CalculableNode implements IExpressionNode<FF.AbilityEvent> {

  constructor(private unit: Base) { }

  nodes: IExpressionNode<FF.AbilityEvent>[];
  value(data: FF.AbilityEvent, context: IProcessingContext): boolean {
    return this.unit.process(data, context);
  }
}


export function factory(name: string, foo: any): Base {
  const b: Builders = {
    count: () => new Count(foo),
    type: () => new Type(foo),
    hp: () => new Hp(foo),
    time: () => new Time(foo),
    name: () => new Name(foo)
  };
  const r = b[name]();
  return r;
}
