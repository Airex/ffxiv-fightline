import {
  jobs,
  boss,
  main,
  job,
  det,
  aoe,
  play,
  target,
  wd,
  damage,
  physical,
  magical,
} from "./testFunctions";

describe("Mitigations", () => {
  it("should mitigate", async () => {
    const result = play(
      jobs.WAR("0:05", "Vengeance"),
      boss("0:10", "test", damage(120000))
    ).mitigate("test");

    expect(result.mitigations[0].mitigation).toBe(0.3);
  });

  it("WAR Nascent Flash on self must not mitigate", async () => {
    const result = play(
      jobs.WAR("0:08", "Nascent Flash"),
      boss("0:10", "test", damage(120000))
    ).mitigate("test");

    expect(result.mitigations[0].mitigation).toBe(0.0);
    expect(result.mitigations[0].shield).toBe(0.0);
  });

  it("DRK double Oblation", async () => {
    const result = play(
      boss("0:10", "test", damage(120000)),
      jobs.DRK("0:05", "Oblation"),
      jobs.DRK("0:07", "Oblation", target("WAR"))
    ).mitigate("test");

    // 0.1 from Oblation + 0.1 from Oblation on WAR
    expect(result.mitigations[0].mitigation).toBe(0.1);
    expect(result.mitigations[1].mitigation).toBe(0.1);
  });

  it("double Feint does not stack", async () => {
    const result = play(
      boss("0:10", "test", damage(120000), physical),
      jobs.MNK("0:05", "Feint"),
      jobs.DRG("0:06", "Feint")
    ).mitigate("test");

    expect(result.mitigations[0].mitigation).toBe(0.1);
    expect(result.mitigations[0].mitigation).toBe(0.1);
  });

  it("Feint 10 on physical", async () => {
    const result = play(
      boss("0:10", "test", damage(120000), physical),
      jobs.MNK("0:05", "Feint")
    ).mitigate("test");

    expect(result.mitigations[0].mitigation).toBe(0.1);
  });

  it("Feint 5 on magical", async () => {
    const result = play(
      boss("0:10", "test", damage(120000), magical),
      jobs.MNK("0:05", "Feint")
    ).mitigate("test");

    expect(result.mitigations[0].mitigation).toBe(0.05);
  });

  it("WAR Shake It Off with additional shield from defensive buffs", async () => {
    const result = play(
      jobs.WAR("0:01", "Thrill Of Battle"),
      jobs.WAR("0:02", "Vengeance"),
      jobs.WAR("0:03", "Bloodwhetting"),
      jobs.WAR("0:05", "Shake It Off"),
      boss("0:10", "test", damage(120000))
    ).mitigate("test");

    expect(result.mitigations[0].shield).toBe(0.21); // Base 15% + 2% per additional buff (3 buffs) = 21%
  });

  it("SCH Deployment Tactics spreads Adloquium shield to party members", async () => {
    const partyMemberCount = 4; // Including the SCH, there are 4 party members

    const result = play(
      // Create a party with 4 members, including the SCH
      job("SCH", wd(100), main(2300), det(2300)), // SCH with 100 WD, 2300 main stat, 2300 det
      job("WAR"),
      job("DRG"),
      job("WHM"),
      jobs.SCH("0:05", "Adloquium"), // SCH casts Adloquium on himself
      jobs.SCH("0:07", "Deployment Tactics"), // SCH casts Deployment Tactics
      // You may need to adjust the codebase to simulate the Adloquium shield spreading to party members if it's not supported yet
      boss("0:10", "test", damage(120000), aoe) // Boss attacks
    ).mitigate("test"); // Check mitigation on the boss attack named "test"

    // Check if each party member received the Adloquium shield
    for (let i = 0; i < partyMemberCount; i++) {
      expect(result.mitigations[i].shield).toBeGreaterThan(0);
    }
  });

  it("MNK Mantra increases SCH Adloquium shield value", async () => {
    const result = play(
      job("SCH", wd(100), main(2300), det(2300)), // SCH with 100 WD, 2300 main stat, 2300 det
      jobs.MNK("0:03", "Mantra"), // MNK uses Mantra
      jobs.SCH("0:05", "Adloquium"), // SCH casts Adloquium on himself
      boss("0:10", "test", damage(120000), aoe) // Boss attacks
    ).mitigate("test"); // Check mitigation on the boss attack named "test"

    expect(result.mitigations[0].shield).toBe(0.156); // Assuming the Adloquium shield value is 0.134 * 1.2
  });

  it("WHM Temperance does not increase SCH Adloquium shield value", async () => {
    const result = play(
      job("SCH", wd(100), main(2300), det(2300)), // SCH with 100 WD, 2300 main stat, 2300 det
      jobs.WHM("0:03", "Temperance"), // WHM uses Temperance
      jobs.SCH("0:05", "Adloquium", target("WHM")), // SCH casts Adloquium on himself
      boss("0:10", "test", damage(120000), aoe) // Boss attacks
    ).mitigate("test"); // Check mitigation on the boss attack named "test"

    expect(result.mitigations[0].name).toBe("SCH");
    expect(result.mitigations[1].name).toBe("WHM");
    expect(result.mitigations[0].shield).toBe(0);
    expect(result.mitigations[1].shield).toBe(0.13);
  });

  it("WAR Thrill Of Battle increases SCH Adloquium shield value on WAR only", async () => {
    const result = play(
      job("SCH", wd(100), main(2300), det(2300)), // SCH with 100 WD, 2300 main stat, 2300 det
      job("WAR", wd(100), main(2300), det(2300)), // DRK with 100 WD, 2300 main stat, 2300 det
      job("DRK", wd(100), main(2300), det(2300)), // DRK with 100 WD, 2300 main stat, 2300 det
      jobs.WAR("0:03", "Thrill of Battle"), // WAR uses Thrill Of Battle
      jobs.SCH("0:05", "Adloquium", target("WAR")), // SCH casts Adloquium on WAR
      boss("0:10", "test", damage(120000), aoe) // Boss attacks
    ).mitigate("test"); // Check mitigation on the boss attack named "test"

    expect(result.mitigations[0].name).toBe("SCH");
    expect(result.mitigations[0].shield).toBe(0);
    expect(result.mitigations[2].name).toBe("DRK");
    expect(result.mitigations[2].shield).toBe(0);
    expect(result.mitigations[1].name).toBe("WAR");
    expect(result.mitigations[1].shield).toBeGreaterThan(0.091);
    expect(result.mitigations[1].hpIncrease).toBe(0.2);
  });

  it("WAR Thrill Of Battle does not increases SCH Adloquium shield value if removed with Shake it off", async () => {
    const result = play(
      job("SCH", wd(100), main(2300), det(2300)), // SCH with 100 WD, 2300 main stat, 2300 det
      job("WAR", wd(100), main(2300), det(2300)), // DRK with 100 WD, 2300 main stat, 2300 det
      jobs.WAR("0:03", "Thrill of Battle"), // WAR uses Thrill Of Battle
      jobs.WAR("0:05", "Shake It Off"), // WAR uses Shake It Off
      jobs.SCH("0:07", "Adloquium", target("WAR")), // SCH casts Adloquium on WAR
      boss("0:10", "test", damage(120000), aoe) // Boss attacks
    ).mitigate("test"); // Check mitigation on the boss attack named "test"

    expect(result.mitigations[0].name).toBe("SCH");
    expect(result.mitigations[0].shield).toBe(0.17);
    expect(result.mitigations[1].name).toBe("WAR");
    expect(result.mitigations[1].shield).toBe(0.269);
    expect(result.mitigations[1].hpIncrease).toBe(0);
  });

  it("Adloquium shield value affected by Thrill of Battle and Mantra", async () => {
    // Adloquium shield without any buffs
    const baseShieldResult = play(
      job("SCH", wd(100), main(2300), det(2300)), // SCH with 100 WD, 2300 main stat, 2300 det
      job("WAR", wd(100), main(2300), det(2300)), // WAR with 100 WD, 2300 main stat, 2300 det
      jobs.SCH("0:05", "Adloquium", target("WAR")), // SCH casts Adloquium on WAR
      boss("0:10", "test", damage(120000)) // Boss attacks
    ).mitigate("test"); // Check mitigation on the boss attack named "test"

    const baseShield = baseShieldResult.mitigations[1].shield;

    // Adloquium shield with Thrill of Battle
    const thrillShieldResult = play(
      job("SCH", wd(100), main(2300), det(2300)), // SCH with 100 WD, 2300 main stat, 2300 det
      job("WAR", wd(100), main(2300), det(2300)), // WAR with 100 WD, 2300 main stat, 2300 det
      jobs.WAR("0:03", "Thrill of Battle"), // WAR uses Thrill Of Battle
      jobs.SCH("0:05", "Adloquium", target("WAR")), // SCH casts Adloquium on WAR
      boss("0:10", "test", damage(120000)) // Boss attacks
    ).mitigate("test"); // Check mitigation on the boss attack named "test"

    const thrillShield = thrillShieldResult.mitigations[1].shield;

    // Adloquium shield with Thrill of Battle and Mantra
    const mantraShieldResult = play(
      job("SCH", wd(100), main(2300), det(2300)), // SCH with 100 WD, 2300 main stat, 2300 det
      job("WAR", wd(100), main(2300), det(2300)), // WAR with 100 WD, 2300 main stat, 2300 det
      job("MNK", wd(100), main(2300), det(2300)), // MNK with 100 WD, 2300 main stat, 2300 det
      jobs.WAR("0:03", "Thrill of Battle"), // WAR uses Thrill Of Battle
      jobs.MNK("0:03", "Mantra"), // MNK uses Mantra
      jobs.SCH("0:05", "Adloquium", target("WAR")), // SCH casts Adloquium on WAR
      boss("0:10", "test", damage(120000)) // Boss attacks
    ).mitigate("test"); // Check mitigation on the boss attack named "test"

    const mantraShield = mantraShieldResult.mitigations[1].shield;

    expect(baseShield).toBeLessThan(thrillShield);
    expect(thrillShield).toBeLessThan(mantraShield);
  });
});

describe("Ability placement in availability zone", () => {
  it("System should use correct time to suggest ability when other ability used after", async () => {
    const result = play(
      job("WAR", wd(100), main(2300), det(2300)), // WAR with 100 WD, 2300 main stat, 2300 det
      jobs.WAR("03:17", "Bloodwhetting"), // WAR uses Thrill Of Battle
      boss("02:58", "test", damage(120000), aoe) // Boss attacks
    ).getGoodTimeForAbility("WAR", "Bloodwhetting", "test");

    expect(result).toBe("02:52");
  });

  it("System should use correct time to suggest ability", async () => {
    const result = play(
      job("WAR", wd(100), main(2300), det(2300)), // WAR with 100 WD, 2300 main stat, 2300 det
      boss("02:58", "test", damage(120000), aoe) // Boss attacks
    ).getGoodTimeForAbility("WAR", "Bloodwhetting", "test");

    expect(result).toBe("02:56");
  });

  it("System should use correct time to suggest ability when other ability used before", async () => {
    const result = play(
      job("WAR", wd(100), main(2300), det(2300)), // WAR with 100 WD, 2300 main stat, 2300 det
      jobs.WAR("02:32", "Bloodwhetting"), // WAR uses Thrill Of Battle
      boss("02:58", "test", damage(120000), aoe) // Boss attacks
    ).getGoodTimeForAbility("WAR", "Bloodwhetting", "test");

    expect(result).toBe("02:57");
  });
});
