import { QiitaFetcher } from "./qiita_fetcher.ts";
import { Media } from "./types.ts";
import { ZennFetcher } from "./zenn_fetcher.ts";

export default function fetchFeed(media: Media) {
  switch (media) {
    case "qiita": {
      const qiitaFetcher = new QiitaFetcher();
      return qiitaFetcher.fetch();
    }
    case "zenn": {
      const zennFetcher = new ZennFetcher();
      return zennFetcher.fetch();
    }
  }
}
