import Parser from 'npm:rss-parser@3.13.0';
import {
  bulkCreateArticle,
  type BulkCreateArticlesParams,
} from './repository.ts';

async function fetchFeed<T>(url: string): Promise<T[]> {
  const parser = new Parser<{ items: T[] }, T>();
  const feed = await parser.parseURL(url);
  return feed.items;
}

const QIITA_URL = 'https://qiita.com/popular-items/feed.atom';

type QiitaItem = {
  title: string;
  author: string;
  content: string;
  link: string;
};

export async function fetchQiitaFeed() {
  const feedItems = await fetchFeed<QiitaItem>(QIITA_URL);

  const params: BulkCreateArticlesParams = feedItems.map((item) => ({
    media: 'qiita',
    title: item.title,
    author: item.author,
    description: item.content,
    url: item.link,
  }));

  await bulkCreateArticle(params);
}

const ZENN_URL = 'https://zenn.dev/feed';

type ZennItem = {
  title: string;
  creator: string;
  content: string;
  link: string;
};

export async function fetchZennFeed() {
  const feedItems = await fetchFeed<ZennItem>(ZENN_URL);

  const params: BulkCreateArticlesParams = feedItems.map((item) => ({
    media: 'zenn',
    title: item.title,
    author: item.creator,
    description: item.content,
    url: item.link,
  }));
  await bulkCreateArticle(params);
}
