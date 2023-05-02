import { Utils, startOffsetConst } from "./Utils";

describe("Utils.time", () => {
  const zeroTestDate = new Date(startOffsetConst);
  const negativeTestDate = new Date(startOffsetConst - (3 * 60 + 12) * 1000);
  const testDate = new Date(startOffsetConst + (3 * 60 + 12) * 1000);
  const testDateBefore = new Date(startOffsetConst + (2 * 60 + 10) * 1000);
  const testDateAfter = new Date(startOffsetConst + (5 * 60 + 20) * 1000);

  beforeEach(() => {});

  it("should format time correctly without sign", async () => {
    expect(Utils.formatTime(testDate)).toEqual("03:12");
  });
  it("should format time correctly with positive sign", async () => {
    expect(Utils.formatTime(new Date(2021, 1, 1, 0, 3, 12), true)).toEqual(
      "+03:12"
    );
  });
  it("should format time correctly with negative sign", async () => {
    expect(Utils.formatTime(negativeTestDate, true)).toEqual("-03:12");
  });
  it("should format negative time correctly without sign", async () => {
    expect(Utils.formatTime(negativeTestDate)).toEqual("-03:12");
  });

  it("should return correct time difference with negative result", async () => {
    expect(Utils.offsetDiff("3:10", "3:12")).toEqual("-00:02");
  });

  it("should return empty string for equal time values", async () => {
    expect(Utils.offsetDiff("3:10", "3:10")).toEqual("");
  });

  it("should return correct time difference with positive result", async () => {
    expect(Utils.offsetDiff("3:12", "3:10")).toEqual("+00:02");
  });
});
