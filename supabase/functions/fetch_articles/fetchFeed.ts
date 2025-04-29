import Parser from 'npm:rss-parser@3.13.0';
import ArticlesRepository from './repository/index.ts';
import { ArticleInput } from './model.ts';

const articlesRepository = new ArticlesRepository();

async function fetchFeed<T>(url: string): Promise<T[]> {
  const parser = new Parser<{ items: T[] }, T>();
  const feed = await parser.parseURL(url);
  return feed.items;
}

 interface ArticleFetcher {
  url: string;
  fetch(): Promise<void>;
}

type QiitaItem = {
  title: string;
  author: string;
  content: string;
  link: string;
};

export class QiitaFetcher implements ArticleFetcher {
  url = 'https://qiita.com/popular-items/feed.atom';

  async fetch() {
    const feedItems = await fetchFeed<QiitaItem>(this.url);

    const params: ArticleInput[] = feedItems.map((item) => ({
      media: 'qiita',
      title: item.title,
      author: item.author,
      description: item.content,
      url: item.link,
    }));

    await articlesRepository.bulkCreateArticle(params);
  }
}


type ZennItem = {
  title: string;
  creator: string;
  content: string;
  link: string;
};
export class ZennFetcher implements ArticleFetcher{
  url = 'https://zenn.dev/feed';

  async fetch() {
    const feedItems = await fetchFeed<ZennItem>(this.url);

    const params: ArticleInput[] = feedItems.map((item) => ({
      media: 'zenn',
      title: item.title,
      author: item.creator,
      description: item.content,
      url: item.link,
    }));

    await articlesRepository.bulkCreateArticle(params);
  }
}
