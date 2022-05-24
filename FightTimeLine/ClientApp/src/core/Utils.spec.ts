import { Utils, startOffsetConst } from "./Utils";

describe('Utils.time', () => {

    const zeroTestDate = new Date(startOffsetConst);
    const negativeTestDate = new Date(startOffsetConst - (3 * 60 + 12) * 1000);
    const testDate = new Date(startOffsetConst + (3 * 60 + 12) * 1000);
    const testDateBefore = new Date(startOffsetConst + (2 * 60 + 10) * 1000);
    const testDateAfter = new Date(startOffsetConst + (5 * 60 + 20) * 1000);

    beforeEach(() => {

    });

    it("f1", async () => {
        expect(Utils.formatTime(testDate)).toEqual("03:12");
    });
    it("f2", async () => {
        expect(Utils.formatTime(new Date(2021, 1, 1, 0, 3, 12), true)).toEqual("+03:12");
    });
    it("f3", async () => {
        expect(Utils.formatTime(negativeTestDate, true)).toEqual("-03:12");
    });
    it("f4", async () => {
        expect(Utils.formatTime(negativeTestDate)).toEqual("-03:12");
    });

    it("fd1", async () => {
        expect(Utils.offsetDiff("3:10", "3:12")).toEqual("-00:02");
    });

    it("fd0", async () => {
        expect(Utils.offsetDiff("3:10", "3:10")).toEqual("");
    });

    it("fd1", async () => {
        expect(Utils.offsetDiff("3:12", "3:10")).toEqual("+00:02");
    });

});


