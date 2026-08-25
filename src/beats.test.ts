import { describe, it, expect } from "vitest";
import { nextBeatDelaySeconds } from "./beats";

describe("nextBeatDelaySeconds", () => {
  it("returns null for null/undefined/non-array input", () => {
    expect(nextBeatDelaySeconds(null, 10)).toBeNull();
    expect(nextBeatDelaySeconds(undefined, 10)).toBeNull();
    expect(nextBeatDelaySeconds({} as any, 10)).toBeNull();
  });

  it("returns null for empty beat list", () => {
    expect(nextBeatDelaySeconds([], 10)).toBeNull();
  });

  it("finds delay until the first upcoming beat", () => {
    const beats = [{ start: 0 }, { start: 0.5 }, { start: 1.0 }];
    expect(nextBeatDelaySeconds(beats, 0.2)).toBeCloseTo(0.3);
    expect(nextBeatDelaySeconds(beats, 0.5)).toBeCloseTo(0.5);
  });

  it("skips beats at or before current progress", () => {
    const beats = [{ start: 0 }, { start: 0.5 }, { start: 1.0 }];
    expect(nextBeatDelaySeconds(beats, 0.75)).toBeCloseTo(0.25);
  });

  it("returns null when all beats are in the past", () => {
    expect(nextBeatDelaySeconds([{ start: 0 }, { start: 0.5 }], 0.9)).toBeNull();
  });

  it("ignores malformed entries", () => {
    const beats: any[] = [null, { start: "x" }, {}, { start: 2.5 }];
    expect(nextBeatDelaySeconds(beats, 1)).toBeCloseTo(1.5);
  });
});
