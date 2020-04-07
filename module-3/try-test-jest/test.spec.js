import { sum } from "./test";


describe("NotificationMessage", () => {
    test("should return sum", () => {
        expect(sum(1, 1)).toEqual(2);
    });
    
    it("should return sum", () => {
        expect(sum(1, 1)).toEqual(2);
    });
});