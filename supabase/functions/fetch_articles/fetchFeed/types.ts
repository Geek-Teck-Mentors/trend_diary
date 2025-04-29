export interface ArticleFetcher {
  url: string;
  fetch(): Promise<void>;
}

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
