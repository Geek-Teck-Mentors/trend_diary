export interface ArticleFetcher {
  url: string;
  fetch(): Promise<FeedItem[]>;
}

export type Media = "qiita" | "zenn";

export type FeedItem = {
  title: string;
  author: string;
  description: string;
  url: string;
};

export type QiitaItem = {
  title: string;
  author: string;
  content: string;
  link: string;
};

export type ZennItem = {
  title: string;
  creator: string;
  content: string;
  link: string;
};
