export type Result<T, E extends Error = Error> = {
  data: T;
  error: null;
} | {
  data: null;
  error: E;
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
