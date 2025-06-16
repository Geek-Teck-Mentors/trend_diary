import React, { useState } from 'react';
import type { MetaFunction } from '@remix-run/cloudflare';
import { TrendingUp, FileText, User, LogOut, X, Calendar, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/application/web/components/ui/card';

export const meta: MetaFunction = () => [{ title: 'トレンド記事 | TrendDiary' }];

interface Article {
  id: number;
  title: string;
  date: string;
  author: string;
  platform: 'Zenn' | 'Qiita';
  content: string;
  tags: string[];
  readTime: string;
}

function ArticleListApp() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const articles: Article[] = [
    {
      id: 1,
      title: "ソケット通信を一緒に理解しよう！！",
      date: "2025/06/11",
      author: "@test",
      platform: "Zenn",
      content: "WebSocketを使ったリアルタイム通信について詳しく解説します。サーバーとクライアント間での双方向通信を実現する方法を学びましょう。",
      tags: ["JavaScript", "WebSocket", "リアルタイム通信"],
      readTime: "5分"
    },
    {
      id: 2,
      title: "【え？通勤中だけでアプリ完成？】時間ゼロの私が\"昼休み駆動開発\"でリリースした話",
      date: "2025/06/11",
      author: "@test",
      platform: "Zenn",
      content: "忙しい日常の中で、通勤時間や昼休みを活用してアプリ開発を行う方法について実体験をもとに紹介します。",
      tags: ["アプリ開発", "時短", "効率化"],
      readTime: "8分"
    },
    {
      id: 3,
      title: "ソケット通信を一緒に理解しよう！！",
      date: "2025/06/11",
      author: "@test",
      platform: "Zenn",
      content: "WebSocketを使ったリアルタイム通信について詳しく解説します。サーバーとクライアント間での双方向通信を実現する方法を学びましょう。",
      tags: ["JavaScript", "WebSocket", "リアルタイム通信"],
      readTime: "5分"
    },
    {
      id: 4,
      title: "ソケット通信を一緒に理解しよう！！",
      date: "2025/06/11",
      author: "@test",
      platform: "Qiita",
      content: "WebSocketを使ったリアルタイム通信について詳しく解説します。サーバーとクライアント間での双方向通信を実現する方法を学びましょう。",
      tags: ["JavaScript", "WebSocket", "リアルタイム通信"],
      readTime: "5分"
    },
    {
      id: 5,
      title: "【え？通勤中だけでアプリ完成？】時間ゼロの私が\"昼休み駆動開発\"でリリースした話",
      date: "2025/06/11",
      author: "@test",
      platform: "Qiita",
      content: "忙しい日常の中で、通勤時間や昼休みを活用してアプリ開発を行う方法について実体験をもとに紹介します。",
      tags: ["アプリ開発", "時短", "効率化"],
      readTime: "8分"
    },
    {
      id: 6,
      title: "【え？通勤中だけでアプリ完成？】時間ゼロの私が\"昼休み駆動開発\"でリリースした話",
      date: "2025/06/11",
      author: "@test",
      platform: "Qiita",
      content: "忙しい日常の中で、通勤時間や昼休みを活用してアプリ開発を行う方法について実体験をもとに紹介します。",
      tags: ["アプリ開発", "時短", "効率化"],
      readTime: "8分"
    },
    {
      id: 7,
      title: "【え？通勤中だけでアプリ完成？】時間ゼロの私が\"昼休み駆動開発\"でリリースした話",
      date: "2025/06/11",
      author: "@test",
      platform: "Zenn",
      content: "忙しい日常の中で、通勤時間や昼休みを活用してアプリ開発を行う方法について実体験をもとに紹介します。",
      tags: ["アプリ開発", "時短", "効率化"],
      readTime: "8分"
    },
    {
      id: 8,
      title: "【え？通勤中だけでアプリ完成？】時間ゼロの私が\"昼休み駆動開発\"でリリースした話",
      date: "2025/06/11",
      author: "@test",
      platform: "Zenn",
      content: "忙しい日常の中で、通勤時間や昼休みを活用してアプリ開発を行う方法について実体験をもとに紹介します。",
      tags: ["アプリ開発", "時短", "効率化"],
      readTime: "8分"
    }
  ];

  const openModal = (article: Article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedArticle(null), 300);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <FileText className="w-6 h-6 text-gray-700" />
            <span className="text-xl font-semibold text-gray-900">TrendDiary</span>
          </div>
          
          <nav className="space-y-2">
            <div className="text-sm font-medium text-gray-500 mb-3">Application</div>
            <div className="flex items-center gap-2 px-3 py-2 text-gray-700 bg-gray-100 rounded-md">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">トレンド記事</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer">
              <FileText className="w-4 h-4" />
              <span className="text-sm">読んだ記事</span>
            </div>
          </nav>
          
          <div className="mt-8">
            <div className="text-sm font-medium text-gray-500 mb-3">User</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer">
                <User className="w-4 h-4" />
                <span className="text-sm">ユーザー名：未設定</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer">
                <LogOut className="w-4 h-4" />
                <span className="text-sm">ログアウト</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-black text-white p-6">
          <h1 className="text-xl font-medium">今日の記事一覧</h1>
        </div>

        {/* Articles Cards */}
        <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">
          <div className="flex flex-wrap gap-4">
            {articles.map((article) => (
              <Card 
                key={article.id} 
                className="w-64 h-32 hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/30 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl"
                onClick={() => openModal(article)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    openModal(article);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <CardContent className="p-4 pt-6 h-full flex flex-col">
                  <h3 className="text-sm font-bold text-gray-700 leading-relaxed flex-1 overflow-hidden">
                    {article.title}
                  </h3>
                  
                  <div className="flex justify-between items-end mt-3">
                    <span className="text-sm text-gray-600">{article.author}</span>
                    {article.platform === 'Qiita' ? (
                      <span className="bg-green-400/70 backdrop-blur-lg text-white text-xs px-2 py-1 rounded-xl font-medium border border-green-300/50 shadow-lg">
                        Qiita
                      </span>
                    ) : (
                      <span className="bg-blue-400/70 backdrop-blur-lg text-white text-xs px-2 py-1 rounded-xl font-medium border border-blue-300/50 shadow-lg">
                        Zenn
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40" 
          onClick={closeModal}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              closeModal();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="モーダルを閉じる"
        />
      )}

      {/* Right Sidebar Modal */}
      <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isModalOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {selectedArticle && (
          <div className="p-6 h-full overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                {selectedArticle.platform === 'Qiita' ? (
                  <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                    Qiita
                  </span>
                ) : (
                  <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                    Zenn
                  </span>
                )}
              </div>
              <button 
                type="button"
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Article Title */}
            <h2 className="text-xl font-bold text-gray-900 mb-4 leading-relaxed">
              {selectedArticle.title}
            </h2>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{selectedArticle.date}</span>
              </div>
              <span>読了時間: {selectedArticle.readTime}</span>
            </div>

            {/* Author */}
            <div className="mb-6">
              <span className="text-sm font-medium text-gray-700">{selectedArticle.author}</span>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {selectedArticle.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">記事の概要</h3>
              <p className="text-gray-700 leading-relaxed">
                {selectedArticle.content}
              </p>
            </div>

            {/* Action Button */}
            <button 
              type="button"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              記事を読む
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ArticleListApp;
