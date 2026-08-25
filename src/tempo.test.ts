import { describe, it, expect } from "vitest";
import { computePlaybackRate, DEFAULT_VIDEO_BPM } from "./tempo";

describe("computePlaybackRate", () => {
  it("returns 1 when track tempo is null", () => {
    expect(computePlaybackRate(null, 135.48)).toBe(1);
  });

  it("returns 1 when track tempo is undefined", () => {
    expect(computePlaybackRate(undefined, 135.48)).toBe(1);
  });

  it("returns 1 when track tempo is NaN, zero, negative or infinite", () => {
    expect(computePlaybackRate(NaN, 135.48)).toBe(1);
    expect(computePlaybackRate(0, 135.48)).toBe(1);
    expect(computePlaybackRate(-120, 135.48)).toBe(1);
    expect(computePlaybackRate(Infinity, 135.48)).toBe(1);
  });

  it("returns ratio of track tempo to video bpm", () => {
    expect(computePlaybackRate(DEFAULT_VIDEO_BPM, DEFAULT_VIDEO_BPM)).toBeCloseTo(1);
    expect(computePlaybackRate(90, 180)).toBeCloseTo(0.5);
    expect(computePlaybackRate(180, 90)).toBeCloseTo(2);
  });

  it("clamps extreme ratios into [0.5, 2]", () => {
    expect(computePlaybackRate(20, 135.48)).toBeCloseTo(0.5);
    expect(computePlaybackRate(500, 100)).toBeCloseTo(2);
  });

  it("falls back to default video bpm when video bpm is invalid", () => {
    expect(computePlaybackRate(135.48, NaN)).toBeCloseTo(1);
    expect(computePlaybackRate(135.48, 0)).toBeCloseTo(1);
    expect(computePlaybackRate(270.96, -5)).toBeCloseTo(2);
  });
});
