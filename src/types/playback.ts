export interface CustomHTMLVideoElement extends HTMLVideoElement {
  playbackRateOverlayEl: HTMLElement,
  slowPlaybackEl: HTMLElement,
  hastenPlaybackEl: HTMLElement,
  seekbarEl: HTMLElement,
  seekbarTooltipEl: HTMLElement,
}

export interface SyncData {
  isRunning: boolean
}

export interface VideoData {
  browserAgent: BrowserAgent,
  focusedVideo: () => CustomHTMLVideoElement,
  playbackChangeRate: number,
  pipButton: HTMLButtonElement,
  eventSyncData: {
    [eventName: string]: SyncData
  },
}

export interface BrowserAgent {
  chrome: boolean,
  firefox: boolean,
}


export enum PlaybackControls {
  Play = "K",
  Ahead5 = "L",
  Prev5 = "J",
  Ahead10 = ";",
  Prev10 = "H",
  Slower = ",",
  Faster = ".",
  Seek0 = "0",
  Seek1 = "1",
  Seek2 = "2",
  Seek3 = "3",
  Seek4 = "4",
  Seek5 = "5",
  Seek6 = "6",
  Seek7 = "7",
  Seek8 = "8",
  Seek9 = "9",
  FullScreen = "`",
}
export const { Play, Prev10, Prev5, Ahead10, Ahead5, Slower, Faster, FullScreen, ...PlaybackSeekControls } = PlaybackControls
export type excludedPlaybackControls =
  | typeof PlaybackControls.Play
  | typeof PlaybackControls.Prev5
  | typeof PlaybackControls.Prev10
  | typeof PlaybackControls.Ahead5
  | typeof PlaybackControls.Ahead10
  | typeof PlaybackControls.Slower
  | typeof PlaybackControls.Faster
  | typeof PlaybackControls.FullScreen
export type PlaybackSeekControls = Exclude<PlaybackControls, excludedPlaybackControls>
export const PlaybackControlValues = Object.values(PlaybackControls)
export const PlaybackSeekControlValues = Object.values(PlaybackSeekControls)
