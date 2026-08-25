export const DEFAULT_VIDEO_BPM = 135.48;

const MIN_RATE = 0.5;
const MAX_RATE = 2;

function validBpm(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function computePlaybackRate(
  trackTempoBpm: number | null | undefined,
  videoDefaultBpm: number
): number {
  const video = validBpm(videoDefaultBpm) ? videoDefaultBpm : DEFAULT_VIDEO_BPM;
  if (!validBpm(trackTempoBpm)) return 1;
  const rate = trackTempoBpm / video;
  return Math.min(MAX_RATE, Math.max(MIN_RATE, rate));
}
