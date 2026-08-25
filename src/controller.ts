import { computePlaybackRate } from "./tempo";
import { nextBeatDelaySeconds, Beat } from "./beats";

export interface AnalysisResult {
  tempoBpm?: number;
  beats?: Beat[];
}

export interface CatJamConfig {
  videoUrl: string;
  defaultBpm: number;
}

/** Player snapshot at the time of an event. */
export interface PlaybackState {
  progressMs: number;
  isPlaying: boolean;
}

interface Deps {
  getConfig(): CatJamConfig;
  fetchAnalysis(uri: string): Promise<AnalysisResult | null>;
}

const SEEK_THRESHOLD_MS = 500;

export function safePlay(video: HTMLVideoElement): void {
  // Autoplay denial or load failure: stay paused, never throw unhandled.
  const p = video.play();
  if (p && typeof p.catch === "function") p.catch(() => {});
}

/** Collapses concurrent calls into one in-flight invocation. */
export function singleFlight<T>(fn: () => Promise<T>): () => Promise<T> {
  let inFlight: Promise<T> | null = null;
  return () => {
    if (!inFlight) {
      inFlight = fn().finally(() => {
        inFlight = null;
      });
    }
    return inFlight;
  };
}

/**
 * Single owner of synchronization state: current track identity, analysis,
 * beat timers and the video element. All async results are guarded by a
 * generation counter plus uri check so late responses can never overwrite
 * a newer track.
 */
export class CatJamController {
  private video: HTMLVideoElement | null = null;
  private generation = 0;
  private currentUri: string | undefined;
  private tempoBpm: number | undefined;
  private beats: Beat[] | undefined;
  private beatTimer: ReturnType<typeof setTimeout> | null = null;
  private lastProgressMs = 0;

  constructor(private deps: Deps) {}

  setVideo(video: HTMLVideoElement | null): void {
    this.video = video;
    this.applyRate();
  }

  onSongChange(uri: string | undefined, state: PlaybackState): void {
    this.generation++;
    this.currentUri = uri;
    this.clearBeatTimer();
    this.tempoBpm = undefined;
    this.beats = undefined;
    this.lastProgressMs = state.progressMs;

    if (!uri) return;
    if (this.video && state.isPlaying) safePlay(this.video);

    const gen = this.generation;
    void this.deps.fetchAnalysis(uri).then((result) => {
      if (gen !== this.generation || uri !== this.currentUri) return; // stale
      this.tempoBpm = result?.tempoBpm;
      this.beats = Array.isArray(result?.beats) ? result!.beats : undefined;
      this.applyRate();
      this.resync(state.progressMs, state.isPlaying);
    });
  }

  onPlayPause(state: PlaybackState): void {
    this.clearBeatTimer();
    if (!state.isPlaying) {
      this.video?.pause();
      return;
    }
    this.resync(state.progressMs, true);
  }

  onProgress(state: PlaybackState): void {
    const jumped =
      Math.abs(state.progressMs - this.lastProgressMs) >= SEEK_THRESHOLD_MS;
    this.lastProgressMs = state.progressMs;
    if (jumped) {
      this.clearBeatTimer();
      this.resync(state.progressMs, state.isPlaying);
    }
  }

  private applyRate(): void {
    if (!this.video) return;
    this.video.playbackRate = computePlaybackRate(
      this.tempoBpm,
      this.deps.getConfig().defaultBpm
    );
  }

  private resync(progressMs: number, isPlaying: boolean): void {
    const video = this.video;
    if (!video || !isPlaying) return;
    const delaySeconds = nextBeatDelaySeconds(this.beats ?? null, progressMs / 1000);
    this.clearBeatTimer();
    // Re-align the loop with the track position regardless of beats.
    video.currentTime = 0;
    if (delaySeconds === null) {
      safePlay(video);
      return;
    }
    this.beatTimer = setTimeout(() => {
      this.beatTimer = null;
      video.currentTime = 0;
      safePlay(video);
    }, Math.max(0, delaySeconds * 1000));
  }

  private clearBeatTimer(): void {
    if (this.beatTimer !== null) {
      clearTimeout(this.beatTimer);
      this.beatTimer = null;
    }
  }
}
