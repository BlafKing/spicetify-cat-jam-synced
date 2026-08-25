export interface Beat {
  start: number;
}

export function nextBeatDelaySeconds(
  beats: readonly Beat[] | null | undefined,
  progressSeconds: number
): number | null {
  if (!Array.isArray(beats)) return null;
  for (const beat of beats) {
    if (beat && typeof beat.start === "number" && beat.start > progressSeconds) {
      return beat.start - progressSeconds;
    }
  }
  return null;
}
