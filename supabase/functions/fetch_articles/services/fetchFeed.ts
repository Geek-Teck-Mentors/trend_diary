import Parser from 'npm:rss-parser@3.13.0';
import { bulkCreateArticle, type BulkCreateArticlesParams } from "../repositories/articleRepository.ts";

const QIITA_URL =  "https://qiita.com/popular-items/feed.atom"
type QiitaItem = {
  title: string;
  author: string;
  content: string;
  link: string;
}

const ZENN_URL =  "https://zenn.dev/feed";
type ZennItem = {
  title: string;
  creator: string;
  content: string;
  link: string;
}

const fetchFeed = async <T>(url: string): Promise<T[]> => {
  const parser = new Parser<{items: T[]}, T>();

  try {
    const feed = await parser.parseURL(url);
    return feed.items;
  } catch (error) {
    console.error("Error fetching feed:", error);
    throw error;
  }
};

export const fetchQiitaFeed = async () => {
  const feedItems = await fetchFeed<QiitaItem>(QIITA_URL);

  const params: BulkCreateArticlesParams = feedItems.map((item) => ({
    media: "qiita",
    title: item.title,
    author: item.author,
    description: item.content,
    url: item.link,
  }));

  const { data: articles, error } = await bulkCreateArticle(params);
  if (error) {
    console.error("Error creating articles:", error);
    throw error;
  }
  return articles;
}

export const fetchZennFeed = async () => {
  const feedItems = await fetchFeed<ZennItem>(ZENN_URL);

  const params: BulkCreateArticlesParams = feedItems.map((item) => ({
    media: "zenn",
    title: item.title,
    author: item.creator,
    description: item.content,
    url: item.link,
  }));
  const { data: articles, error } = await bulkCreateArticle(params);
  if (error) {
    console.error("Error creating articles:", error);
    throw error;
  }
  return articles;
}
