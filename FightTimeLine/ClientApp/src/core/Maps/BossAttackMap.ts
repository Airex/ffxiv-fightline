import { DataItem } from "vis-timeline";
import { BaseMap, IOverlapCheckData } from "./BaseMap";
import { Utils } from "../Utils";
import * as Models from "../Models";
import { IForSidePanel, IMoveable } from "../Holders/BaseHolder";
import * as _ from "lodash";

export interface IBossAttackMapData {
  vertical?: boolean;
  attack?: Models.IBossAbility;
}

export class BossAttackMap extends BaseMap<string, DataItem, IBossAttackMapData> implements IMoveable, IForSidePanel {
  sidePanelComponentName = "bossAbility";

  public visible = true;

  onDataUpdate(data: IBossAttackMapData, originalData: IBossAttackMapData): void {
    if (originalData && originalData.attack) {
      this.attack.tags = originalData.attack.tags;
    }
    this.setItem(this.createBossAttack(this.id, data.attack, data.vertical));
  }

  constructor(presenter: Models.IPresenterData, id: string, data: IBossAttackMapData) {
    super(presenter, id);
    this.applyData(data);
  }

  get start(): Date {
    return this.item.start as Date;
  }

  get offset(): string {
    return Utils.formatTime(this.start);
  }

  get startAsNumber(): number {
    return this.start.valueOf() as number;
  }

  get attack(): Models.IBossAbility {
    return this.data.attack;
  }

  get pinned(): boolean {
    return !!this.attack.pinned;
  }

  get fromFFLogs(): boolean {
    return !!this.attack.fflogsAttackSource;
  }

  get fflogsDataString() {
    return JSON.stringify(this.data.attack.fflogsData);
  }

  public isForFfLogs(source: string){
    return (this.attack.fflogsAttackSource === undefined
      || source === this.attack.fflogsAttackSource
      || this.pinned)
  }



  createBossAttack(id: string, attack: Models.IBossAbility, vertical: boolean): DataItem {
    const cls = { bossAttack: true, vertical };
    Object.keys(Models.DamageType).forEach((value) => {
      cls[value] = attack.type === Models.DamageType[value];
    });

    ["red", "blue", "pink", "purple", "green", "orange", "silver"].forEach(c => {
      cls[c] = attack.color === c;
    });

    return  {
      id,
      content: this.createBossAttackElement(attack),
      start: Utils.getDateFromOffset(attack.offset),
      group: "boss",
      type: "box",
      className: this.buildClass(cls),
      selectable: true,
      title: attack.offset
    } as DataItem;
  }

  private createBossAttackElement(ability: Models.IBossAbility): string {
    return "<div><div class='marker'></div><div class='name'>" +
      Utils.escapeHtml(ability.name) +
      "</div></div>";
  }

  move(delta: number): boolean {
    const newDate = new Date(this.startAsNumber + delta * 1000);
    this.applyData({ attack: { offset: Utils.formatTime(newDate) } });
    return true;
  }

  public get isTankBuster(): boolean {
    return this.attack.tags && this.attack.tags.indexOf(Models.DefaultTags[0]) >= 0;
  }

  public get isAoe(): boolean {
    return this.attack.tags && this.attack.tags.indexOf(Models.DefaultTags[1]) >= 0;
  }

  public get isShareDamage(): boolean {
    return this.attack.tags && this.attack.tags.indexOf(Models.DefaultTags[2]) >= 0;
  }

  canMove(overlapData: IOverlapCheckData): boolean {
    return overlapData.start >= overlapData.globalStart;
  }
}

