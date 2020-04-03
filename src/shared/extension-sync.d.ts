export interface MessageOptions {
  mWindow?: Window,
  target?: string,
}

export interface WindowMessageData<T> {
  data: {
    extension: string,
    data: T,
    messageType: string,
  }
}

interface KeyboardData {
  key: string,
  ctrlKey: boolean,
  shiftKey: boolean,
  altKey: boolean,
}

export interface PlaybackControlsData {
  url: string,
  isFirstSync?: boolean,
  keyboard?: KeyboardData,
}

export type InternalMessageListener<T> = (eventData: WindowMessageData<T>) => void
export type ExternalMessageListener<T> = (data: T, listener: InternalMessageListener<T>) => void

export declare function sendPlaybackWindowMessage<T>(data: T, options: MessageOptions): void
export declare function getWindowMessage<T>(cond: (data: T) => boolean): Promise<T>
export declare function setWindowMessageListener<T>(cond: (data: T) => boolean): (listener: ExternalMessageListener<T>) => void

export interface WindowMessagingDict {
  playback: WindowMessaging<PlaybackControlsData>
}

export interface WindowMessaging<T> {
  addListener: (cond: (data: T) => boolean) => (listener: ExternalMessageListener<T>) => void,
  sendMessage: (data: T, options: MessageOptions) => void,
  once: (cond: (data: T) => boolean) => Promise<T>,
}

export declare const windowMessaging: WindowMessagingDict 