import { process } from "./BossAttackProcessors"
import * as FF from "./FFLogs"
import * as M from "./Models"

describe('BossAttackProcessors', () => {
  beforeEach(() => {

  });

  const event = (index: number, at: number): FF.CastEvent => {
    return {
      ability: {
        name: "a" + index,
        guid: index,
        type: FF.AbilityType.PHYSICAL_DIRECT,
        abilityIcon: ""
      },
      timestamp: at * 1000 * 10,
      type: 'cast',
      sourceIsFriendly: false,
      targetIsFriendly: true,
    }
  }

  it("t1", async () => {
    const data: FF.CastEvent[] = [
      event(1, 1),
      event(2, 2),
      event(5, 3),
      event(6, 4),
      event(8, 5),
      event(9, 6)
    ];
    const attacks: M.IBossAbility[] = [
      {
        offset: "00:10",
        name: "a1"
      },
      {
        offset: "00:20",
        name: "a2"
      },
      {
        offset: "00:30",
        name: "a3"
      },
      {
        offset: "00:40",
        name: "a4"
      },
      {
        offset: "00:50",
        name: "a5",
        syncSettings: JSON.stringify(<M.ISyncData>{
          offset: "00:00",
          condition: <M.ISyncSettingGroup>{
            operation: M.SyncOperation.And,
            operands: [
              {
                description: "c1",
                type: 'name',
                payload: {
                  name: "a5"
                }
              },
              {
                description: "c2",
                type: 'count',
                payload: {
                  name: "a5",
                  countComparer: "e",
                  count: 1
                }
              }]
          }
        })
      },
      {
        offset: "01:00",
        name: "a6"
      },
      {
        offset: "01:10",
        name: "a7"
      },
      {
        offset: "01:20",
        name: "a8",
        syncDowntime: "d1",
        syncSettings: JSON.stringify(<M.ISyncData>{
          offset: "00:00",
          condition: <M.ISyncSettingGroup>{
            operation: M.SyncOperation.And,
            operands: [
              {
                description: "c1",
                type: 'name',
                payload: {
                  name: "a8"
                }
              },
              {
                description: "c2",
                type: 'count',
                payload: {
                  name: "a8",
                  countComparer: "e",
                  count: 1
                }
              }]
          }
        })
      },
      {
        offset: "01:30",
        name: "a9"
      }
    ];
    const downtime = {start: "01:10", end: "01:20", id: "d1", color: "", comment: ""};
    const actual = process(data, 0, attacks, [downtime]);
    expect(actual).not.toBeNull();
    expect(downtime.start).toEqual("00:40");
    expect(downtime.end).toEqual("00:50");
    expect(actual && actual.map(t => t.name)).toEqual(["a1", "a2", "a5", "a6", "a8", "a9"]);
    expect(actual && actual.map(t => t.offset)).toEqual(["00:10", "00:20", "00:30", "00:40", "00:50", "01:00"]);
  });
});


