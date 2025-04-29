export class RssParserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RssParserError";
  }
}

export class InvalidMediaError extends Error {
  constructor(media: string) {
    super(`Invalid media type: ${media}`);
    this.name = "InvalidMediaError";
  }
}
