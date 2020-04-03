interface MessageOptions {
  mWindow: Window,
  target: string,
}

export declare function sendWindowMessage(data: any, options: MessageOptions): void
export declare function getWindowMessage<T>(cond: (data: T) => boolean): Promise<T>
