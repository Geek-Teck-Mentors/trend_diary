export interface RequestInfo {
  url: string
  method: string
  userAgent: string
}

export interface ChatNotifier {
  error(error: Error, requestInfo: RequestInfo): Promise<void>
}
