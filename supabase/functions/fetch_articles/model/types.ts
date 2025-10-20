export type Result<T> = {
  data: T;
  error: Error | null;
};

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
