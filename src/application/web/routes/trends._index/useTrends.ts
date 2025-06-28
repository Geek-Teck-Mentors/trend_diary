import { useEffect } from "react";
import { Direction } from "./types"

type Params = {
  fetchArticles: (params: { date?: Date; direction?: Direction; limit?: number; }) => Promise<void>;
};

export default function useTrends(params: Params) {
  const { fetchArticles } = params;

  const date = new Date();

  // INFO: 初回読み込み時に今日の日付で記事を取得
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchArticles({date});
  });

  return {
    date,
  }
}
