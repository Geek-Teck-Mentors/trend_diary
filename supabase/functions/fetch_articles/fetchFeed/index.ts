import Parser from "npm:rss-parser@3.13.0";
import ArticlesRepository from "../repository/index.ts";
import { ArticleInput } from "../model.ts";
import { ArticleFetcher, QiitaItem, ZennItem } from "./types.ts";
import { InvalidMediaError, RssParserError } from "./error.ts";

const articlesRepository = new ArticlesRepository();

async function _fetchRSSFeed<T>(url: string): Promise<T[]> {
  const parser = new Parser<{ items: T[] }, T>();
  const feed = await parser.parseURL(url);
  return feed.items;
}

class QiitaFetcher implements ArticleFetcher {
  url = "https://qiita.com/popular-items/feed.atom";

  async fetch() {
    const feedItems = await _fetchRSSFeed<QiitaItem>(this.url);
    let params: ArticleInput[] = [];

    try {
      params = feedItems.map((item) => ({
        media: "qiita",
        title: item.title,
        author: item.author,
        description: item.content,
        url: item.link,
      }));
    } catch (error) {
      console.error("Error processing feed items:", error);
      throw new RssParserError("Failed to process feed items: " + error);
    }

    await articlesRepository.bulkCreateArticle(params);
  }
}

class ZennFetcher implements ArticleFetcher {
  url = "https://zenn.dev/feed";
  async fetch() {
    const feedItems = await _fetchRSSFeed<ZennItem>(this.url);
    let params: ArticleInput[] = [];

    try {
      params = feedItems.map((item) => ({
        media: "zenn",
        title: item.title,
        author: item.creator,
        description: item.content,
        url: item.link,
      }));
    } catch (error) {
      console.error("Error processing feed items:", error);
      throw new RssParserError("Failed to process feed items: " + error);
    }

    await articlesRepository.bulkCreateArticle(params);
  }
}

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
