import { InvalidMediaError } from "./error.ts";
import { QiitaFetcher } from "./qiita_fetcher.ts";
import { ZennFetcher } from "./zenn_fetcher.ts";

export default function fetchFeed(media: string) {
  switch (media) {
    case "qiita": {
      const qiitaFetcher = new QiitaFetcher();
      return qiitaFetcher.fetch();
    }
    case "zenn": {
      const zennFetcher = new ZennFetcher();
      return zennFetcher.fetch();
    }
    default: {
      throw new InvalidMediaError(media);
    }
  }
}
