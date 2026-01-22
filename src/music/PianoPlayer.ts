import Soundfont from "soundfont-player";

/**
 * Simple singleton piano player built on top of soundfont-player.
 * - Loads `acoustic_grand_piano` instrument.
 * - Plays polyphonic chords (all notes at once).
 * - Stops previous sounds with a short fade-out to avoid clicks.
 */

/**
 * Node returned by soundfont-player when playing a note. It may be an
 * AudioBufferSourceNode or an object exposing a `stop()` method.
 */
type PlayedNode = AudioBufferSourceNode | { stop: () => void };

/** Minimal interface for the soundfont-player instrument used here. */
interface SFInstrument {
  play(
    note: string,
    when?: number,
    options?: { duration?: number; destination?: AudioNode }
  ): PlayedNode;
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

/**
 * Normalize a note name to include octave information.
 * Converts musical flat (♭) and sharp (♯) symbols to ASCII equivalents.
 * If the note doesn't have an octave number, appends "4" (middle octave).
 * @param note Note name to normalize (e.g., "C", "F#", "B♭")
 * @returns Normalized note with octave (e.g., "C4", "F#4", "Bb4")
 */
function normalizeNote(note: string) {
  const n = note.replace(/\u266d/g, "b").replace(/\u266f/g, "#");

  if (/\d/.test(n)) return n;
  return `${n}4`;
}

class PianoPlayerClass {
  private isRecreating = false;
  private recreateTimeoutId: number | null = null;
  private mediaStreamDest: MediaStreamAudioDestinationNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private instrument: SFInstrument | null = null;
  private masterGain: GainNode | null = null;
  private playingNodes: PlayedNode[] = [];
  private sequenceTimers: number[] = [];
  private sequenceToken = 0;
  private loading: Promise<void> | null = null;
  private muted = false;

  /**
   * Clear all scheduled sequence timers and increment the sequence token.
   * This prevents any pending scheduled chord playback from starting.
   */
  private clearSequenceTimers() {
    for (const t of this.sequenceTimers) {
      try {
        clearTimeout(t);
      } catch (err) {
        console.warn("PianoPlayer: clearTimeout failed", err);
      }
    }
    this.sequenceTimers = [];
    this.sequenceToken += 1;
  }

  /**
   * Initialize runtime-only listeners.
   * Registers a visibilitychange listener so the player can proactively
   * suspend the AudioContext when the document is hidden and resume or
   * recreate it when visible again.
   */
  constructor() {
    if (typeof document !== "undefined" && document.addEventListener) {
      this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
      document.addEventListener(
        "visibilitychange",
        this.handleVisibilityChange
      );
    }
  }

  /**
   * Ensure the AudioContext and piano instrument are loaded and ready.
   * Initializes the AudioContext, creates the master gain node, sets up
   * MediaStream bridge for iOS Safari, and loads the acoustic_grand_piano soundfont.
   * @returns Promise that resolves when initialization is complete
   */
  async ensureLoaded() {
    if (this.instrument && this.audioCtx) return;
    if (this.loading) return this.loading;
    this.loading = (async () => {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AC();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = 10;
      this.masterGain.connect(this.audioCtx.destination);
      try {
        this.mediaStreamDest = this.audioCtx.createMediaStreamDestination();
        this.masterGain.connect(this.mediaStreamDest);

        if (!this.audioElement) this.audioElement = new Audio();
        this.audioElement.autoplay = true;

        try {
          this.audioElement.srcObject = this.mediaStreamDest.stream;
          void this.audioElement.play();
        } catch (err) {
          console.debug("PianoPlayer: audioElement.play() failed", err);
        }
      } catch (err) {
        console.debug("PianoPlayer: mediaStream bridge not available", err);
        this.mediaStreamDest = null;
      }
      this.instrument = (await Soundfont.instrument(
        this.audioCtx,
        "acoustic_grand_piano"
      )) as SFInstrument;
    })();
    return this.loading;
  }

  /**
   * Return whether the player currently believes it is actively playing.
   * Checks if there are active playing nodes or pending sequence timers.
   * @returns True if playing or has pending playback, false otherwise
   */
  private isActuallyPlaying() {
    return this.playingNodes.length > 0 || this.sequenceTimers.length > 0;
  }

  /**
   * Visibility change handler. When the document becomes hidden, proactively
   * suspend the AudioContext if nothing is playing to avoid Safari killing
   * a running-but-silent context. When visible, attempt to resume or
   * recreate the context if necessary.
   */
  private handleVisibilityChange() {
    try {
      if (document.visibilityState === "hidden") {
        void this.suspendAudioContext();
      } else {
        void this.resumeOrRecreateAudioContext();
      }
    } catch (err) {
      console.warn("PianoPlayer: visibility handler failed", err);
    }
  }

  /**
   * Suspend the AudioContext proactively when hidden and the player is idle.
   * This helps avoid mobile browsers (especially Safari) from killing the context
   * when it's running but not producing sound.
   * @returns Promise that resolves when suspension is complete
   */
  private async suspendAudioContext() {
    try {
      if (!this.audioCtx) return;
      if (this.isActuallyPlaying()) return;
      if (this.audioCtx.state === "running") {
        await this.audioCtx.suspend();
        console.debug("PianoPlayer: audioCtx suspended proactively");
      }
    } catch (err) {
      console.warn("PianoPlayer: suspendAudioContext failed", err);
    }
  }

  /**
   * Try to resume the existing AudioContext. If resume does not result in a
   * running context, close and recreate the context and reload the instrument.
   * This handles cases where mobile browsers have suspended or closed the AudioContext.
   * @returns Promise that resolves when resume or recreation is complete
   */
  private async resumeOrRecreateAudioContext() {
    try {
      if (this.isRecreating) return;
      if (!this.audioCtx) {
        this.instrument = null;
        await this.ensureLoaded();
        console.debug("PianoPlayer: recreated audioCtx via ensureLoaded");
        return;
      }

      try {
        await this.audioCtx.resume();
      } catch (err) {
        console.debug("PianoPlayer: audioCtx.resume() threw", err);
      }

      await new Promise((r) => setTimeout(r, 220));

      if (this.audioCtx.state === "running") {
        console.debug("PianoPlayer: audioCtx resumed successfully");
        return;
      }

      this.isRecreating = true;
      try {
        await this.audioCtx.close();
      } catch (err) {
        console.warn("PianoPlayer: audioCtx.close() failed", err);
      }
      try {
        if (this.audioElement) this.audioElement.srcObject = null;
      } catch (err) {
        console.error(
          "PianoPlayer: clearing audioElement.srcObject failed",
          err
        );
      }
      this.audioCtx = null;
      this.instrument = null;

      if (this.recreateTimeoutId) {
        clearTimeout(this.recreateTimeoutId);
        this.recreateTimeoutId = null;
      }
      this.recreateTimeoutId = window.setTimeout(async () => {
        try {
          await this.ensureLoaded();
          try {
            if (this.mediaStreamDest && this.audioElement) {
              this.audioElement.srcObject = this.mediaStreamDest.stream;
              void this.audioElement.play();
            }
          } catch (err) {
            console.debug("PianoPlayer: reconnect audioElement failed", err);
          }
          console.debug("PianoPlayer: audioCtx recreated after resume failure");
        } catch (err) {
          console.warn("PianoPlayer: recreate failed", err);
        } finally {
          this.isRecreating = false;
          if (this.recreateTimeoutId) {
            clearTimeout(this.recreateTimeoutId);
            this.recreateTimeoutId = null;
          }
        }
      }, 300);
    } catch (err) {
      console.warn("PianoPlayer: resumeOrRecreateAudioContext failed", err);
      this.isRecreating = false;
    }
  }

  /**
   * Play a chord (array of note names like C, F#, B♭). Polyphonic: all notes start together.
   * Stops any currently playing sounds before starting the new chord.
   * @param noteNames Array of note names to play simultaneously
   * @param durationMs How long to let the sample play (defaults to 1400ms)
   * @param fadeMs Fade-out duration in milliseconds when stopping previous sounds (defaults to 60ms)
   * @returns Promise that resolves when playback is initiated
   */
  async playChord(noteNames: string[], durationMs = 1400, fadeMs = 60) {
    if (this.muted) return;
    await this.ensureLoaded();
    if (!this.instrument || !this.audioCtx || !this.masterGain) return;

    this.stopAll(fadeMs);

    const now = this.audioCtx.currentTime;
    const durationSec = Math.max(0.05, durationMs / 1000);
    const nodes: PlayedNode[] = [];

    for (const n of noteNames) {
      const nn = normalizeNote(n);
      try {
        const node = this.instrument.play(nn, now, {
          duration: durationSec,
          destination: this.masterGain,
        });
        if (node && typeof (node as PlayedNode).stop === "function") {
          nodes.push(node as PlayedNode);
        }
      } catch (err) {
        console.warn("PianoPlayer: play failed for", nn, err);
      }
    }
    this.playingNodes = nodes;

    setTimeout(() => {
      for (const node of this.playingNodes) {
        try {
          if (typeof (node as PlayedNode).stop === "function") {
            (node as PlayedNode).stop();
          }
        } catch (err) {
          console.warn("PianoPlayer: stop failed", err);
        }
      }
      this.playingNodes = [];
      if (this.masterGain && this.audioCtx)
        this.masterGain.gain.setValueAtTime(
          1,
          this.audioCtx.currentTime + 0.001
        );
    }, durationMs + 200);
  }

  /**
   * Play a sequence of chords (array of note arrays), one after another.
   * Each chord plays for `perChordMs` milliseconds with a short gap between chords.
   * @param chords Array of chord arrays, where each chord is an array of note names
   * @param perChordMs Duration in milliseconds for each chord (defaults to 900ms)
   * @param fadeMs Fade-out duration in milliseconds when stopping previous sounds (defaults to 60ms)
   * @returns Promise that resolves when the sequence is scheduled
   */
  async playSequence(chords: string[][], perChordMs = 900, fadeMs = 60) {
    if (this.muted) return;
    await this.ensureLoaded();
    if (!this.audioCtx) return;
    this.stopAll(fadeMs);
    this.clearSequenceTimers();
    const myToken = this.sequenceToken;
    let delay = 0;
    for (const chord of chords) {
      const timer = window.setTimeout(() => {
        if (myToken !== this.sequenceToken) return;
        this.playChord(chord, perChordMs, fadeMs);
      }, delay) as unknown as number;
      this.sequenceTimers.push(timer);
      delay += perChordMs;
    }
  }

  /**
   * Cancel any pending scheduled sequence callbacks and stop currently
   * playing notes with an optional short fade.
   * This stops future scheduled chords from starting after cancellation.
   * @param fadeMs Fade-out duration in milliseconds (defaults to 60ms)
   */
  stopSequence(fadeMs = 60) {
    try {
      this.clearSequenceTimers();
    } catch (err) {
      console.warn("PianoPlayer: clearSequenceTimers failed", err);
    }
    try {
      this.stopAll(fadeMs);
    } catch (err) {
      console.warn("PianoPlayer: stopAll failed in stopSequence", err);
    }
  }

  /**
   * Stop all currently playing notes with a short fade-out.
   * Uses gain ramping to avoid audio clicks and pops.
   * @param fadeMs Fade-out duration in milliseconds (defaults to 60ms)
   */
  stopAll(fadeMs = 60) {
    if (!this.masterGain || !this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    try {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + fadeMs / 1000);
    } catch (err) {
      console.warn("PianoPlayer: gain scheduling failed", err);
    }
    const nodes = this.playingNodes.slice();
    setTimeout(() => {
      for (const n of nodes) {
        try {
          if (typeof (n as PlayedNode).stop === "function") {
            (n as PlayedNode).stop();
          }
        } catch (err) {
          console.warn("PianoPlayer: node stop failed", err);
        }
      }
      this.playingNodes = [];
      if (this.masterGain && this.audioCtx) {
        this.masterGain.gain.setValueAtTime(
          1,
          this.audioCtx.currentTime + 0.01
        );
      }
    }, fadeMs + 8);
  }

  /**
   * Mute or unmute the player. When muted, playback is suppressed and current
   * sounds are stopped immediately.
   * @param v True to mute, false to unmute
   */
  setMuted(v: boolean) {
    this.muted = !!v;
    if (this.muted) {
      try {
        this.stopSequence(40);
      } catch (err) {
        console.warn("PianoPlayer: stopSequence failed during mute", err);
      }
    }
  }
}

const PianoPlayer = new PianoPlayerClass();
export default PianoPlayer;
