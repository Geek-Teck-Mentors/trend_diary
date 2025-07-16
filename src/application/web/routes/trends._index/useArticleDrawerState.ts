import { useState } from "react";
import { Article } from "./types";

export default function useArticleDrawerState() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const open = (article: Article) => {
    setSelectedArticle(article);
    setIsOpen(true);
  };

  const close = () => {
    setSelectedArticle(null);
    setIsOpen(false);
  };

  return {
    isOpen,
    selectedArticle,
    open,
    close,
  };
}
