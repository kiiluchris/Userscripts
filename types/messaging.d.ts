interface MessageOptions {
  mWindow?: Window,
  target?: string,
}

interface WindowMessageData<T> {
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

interface PlaybackControlsData {
  url: string,
  isFirstSync?: boolean,
  keyboard?: KeyboardData,
}


type InternalMessageListener<T> = (eventData: WindowMessageData<T>) => void
type ExternalMessageListener<T> = (data: T, listener: InternalMessageListener<T>) => void

interface WindowMessagingDict {
  qtfra: WindowMessaging<string>;
}

interface WindowMessaging<T> {
  addListener: (cond: (data: T) => boolean) => (listener: ExternalMessageListener<T>) => void,
  sendMessage: (data: T, options: MessageOptions) => void,
  once: (cond: (data: T) => boolean) => Promise<T>,
}
