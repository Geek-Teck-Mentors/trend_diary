import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import type { ArticleOutput } from '@/domain/article/schema/articleSchema'
import ArticleDrawer from './ArticleDrawer'

// テスト用のモックデータ
const mockQiitaArticle: ArticleOutput = {
  articleId: 1n,
  media: 'qiita',
  title: 'React 19の新機能を徹底解説！Server Componentsとは',
  author: 'tech_blogger',
  description:
    'React 19で導入されるServer Componentsについて詳しく解説します。従来のクライアントサイドレンダリングとの違いや、実装方法、パフォーマンス向上のメリットについて具体的なコード例とともに説明していきます。',
  url: 'https://qiita.com/tech_blogger/items/react19-server-components',
  createdAt: new Date('2024-01-15T10:30:00Z'),
}

const mockZennArticle: ArticleOutput = {
  articleId: 2n,
  media: 'zenn',
  title: 'TypeScript 5.3の新機能まとめ',
  author: 'frontend_dev',
  description:
    'TypeScript 5.3で追加された新機能について詳しく解説します。型安全性の向上、パフォーマンスの改善、新しい型操作について実際のコードサンプルとともに紹介していきます。',
  url: 'https://zenn.dev/frontend_dev/articles/typescript-5-3-features',
  createdAt: new Date('2024-02-20T14:45:00Z'),
}

const meta: Meta<typeof ArticleDrawer> = {
  component: ArticleDrawer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '記事の詳細情報を表示するドロワーコンポーネント',
      },
    },
  },
  args: {
    isOpen: true,
    onClose: () => {},
  },
}
export default meta

type Story = StoryObj<typeof ArticleDrawer>

export const Default: Story = {
  args: {
    article: mockQiitaArticle,
  },
  play: async ({ canvas }) => {
    // ドロワーが表示されることを確認（ポータル経由でdocument.bodyに描画される）
    await waitFor(() => {
      const drawer = within(document.body).getByRole('dialog', { hidden: true })
      expect(drawer).toBeInTheDocument()
    })

    // 記事タイトルが表示されることを確認
    await expect(within(document.body).getByText(mockQiitaArticle.title)).toBeInTheDocument()

    // 作成者が表示されることを確認
    await expect(within(document.body).getByText(mockQiitaArticle.author)).toBeInTheDocument()

    // 記事の説明が表示されることを確認
    await expect(within(document.body).getByText(mockQiitaArticle.description)).toBeInTheDocument()

    // 作成日が表示されることを確認（ローカライズされた形式）
    const formattedDate = mockQiitaArticle.createdAt.toLocaleDateString()
    await expect(within(document.body).getByText(formattedDate)).toBeInTheDocument()

    // 「記事を読む」ボタンが存在することを確認
    await expect(within(document.body).getByRole('link', { name: '記事を読む' })).toBeInTheDocument()

    // 閉じるボタンが存在することを確認
    const closeButton = within(document.body).getByRole('button', { name: 'Close' })
    await expect(closeButton).toBeInTheDocument()
  },
}

export const QiitaArticle: Story = {
  args: {
    article: mockQiitaArticle,
  },
  play: async ({ canvas }) => {
    // Qiitaメディアアイコンが表示されることを確認
    const mediaIcon = within(document.body).getByTestId('media-icon')
    await expect(mediaIcon).toBeInTheDocument()

    // 記事URLが正しく設定されていることを確認
    const readButton = within(document.body).getByRole('link', { name: '記事を読む' })
    await expect(readButton).toHaveAttribute('href', mockQiitaArticle.url)
    await expect(readButton).toHaveAttribute('target', '_blank')
    await expect(readButton).toHaveAttribute('rel', 'noopener noreferrer nofollow')
  },
}

export const ZennArticle: Story = {
  args: {
    article: mockZennArticle,
  },
  play: async ({ canvas }) => {
    // Zennの記事タイトルが表示されることを確認
    await expect(within(document.body).getByText(mockZennArticle.title)).toBeInTheDocument()

    // Zennの作成者が表示されることを確認
    await expect(within(document.body).getByText(mockZennArticle.author)).toBeInTheDocument()

    // 記事URLが正しく設定されていることを確認
    const readButton = within(document.body).getByRole('link', { name: '記事を読む' })
    await expect(readButton).toHaveAttribute('href', mockZennArticle.url)
  },
}

export const InteractionTest: Story = {
  args: {
    article: mockQiitaArticle,
    onClose: () => console.log('ドロワーが閉じられました'),
  },
  play: async ({ canvas }) => {
    // 閉じるボタンをクリックして動作を確認
    const closeButton = within(document.body).getByRole('button', { name: 'Close' })
    await userEvent.click(closeButton)

    // 「記事を読む」ボタンにホバーした時の効果を確認
    const readButton = within(document.body).getByRole('link', { name: '記事を読む' })
    await userEvent.hover(readButton)
    await expect(readButton).toHaveClass('hover:bg-blue-600')

    // Xアイコンの存在確認
    const xIcon = within(document.body).getByTestId('x-icon')
    await expect(xIcon).toBeInTheDocument()

    // 外部リンクアイコンの存在確認
    const externalLinkIcon = readButton.querySelector('svg')
    await expect(externalLinkIcon).toBeInTheDocument()
  },
}

export const UIElementsValidation: Story = {
  args: {
    article: mockQiitaArticle,
  },
  play: async ({ canvas }) => {
    // data-slot属性を持つ要素が存在することを確認
    const headerIcon = within(document.body).getByTestId('drawer-header-icon')
    await expect(headerIcon).toBeInTheDocument()

    const contentMeta = within(document.body).getByTestId('drawer-content-meta')
    await expect(contentMeta).toBeInTheDocument()

    const contentAuthor = within(document.body).getByTestId('drawer-content-author')
    await expect(contentAuthor).toBeInTheDocument()

    const contentDescription = within(document.body).getByTestId('drawer-content-description')
    await expect(contentDescription).toBeInTheDocument()

    const contentDescriptionText = within(document.body).getByTestId('drawer-content-description-content')
    await expect(contentDescriptionText).toBeInTheDocument()

    const contentLink = within(document.body).getByTestId('drawer-content-link')
    await expect(contentLink).toBeInTheDocument()

    // カレンダーアイコンの存在確認（SVG要素として確認）
    const calendarIcon = within(contentMeta).getByTestId('calendar-icon')
    await expect(calendarIcon).toBeInTheDocument()

    // 「記事の概要」ヘッダーが存在することを確認
    await expect(within(document.body).getByText('記事の概要')).toBeInTheDocument()
  },
}

export const LongContentTest: Story = {
  args: {
    article: {
      ...mockQiitaArticle,
      title: 'とても長いタイトルのテスト記事：React Server Components、TypeScript 5.3、Next.js 14、Remix、Vite、そしてモダンフロントエンド開発の全てを網羅した完全ガイド',
      description:
        'この記事は非常に長い説明文を含むテスト用の記事です。複数行にわたる長いテキストがどのように表示されるかを確認するためのものです。実際のプロダクトでは、このような長い説明文が表示される可能性があるため、UIが適切に対応できることを確認する必要があります。テキストの折り返し、スクロール動作、レイアウトの崩れがないかなどを検証していきます。',
      author: 'very_long_author_name_for_testing_ui_layout',
    },
  },
  play: async ({ canvas }) => {
    // 長いコンテンツでもレイアウトが崩れないことを確認
    await waitFor(() => {
      const drawer = within(document.body).getByRole('dialog', { hidden: true })
      expect(drawer).toBeInTheDocument()
    })

    // タイトルが表示されることを確認（長いタイトル）
    await expect(within(document.body).getByText(/とても長いタイトルのテスト記事/)).toBeInTheDocument()

    // 長い作成者名が表示されることを確認
    await expect(within(document.body).getByText('very_long_author_name_for_testing_ui_layout')).toBeInTheDocument()

    // スクロール可能な領域が存在することを確認
    const scrollableArea = within(document.body).getByTestId('scrollable-area')
    await expect(scrollableArea).toBeInTheDocument()
  },
}

export const ClosedState: Story = {
  args: {
    article: mockQiitaArticle,
    isOpen: false,
  },
  play: async ({ canvas }) => {
    // ドロワーが閉じている時は要素が表示されないことを確認
    // createPortalで描画されるため、通常のcanvasでは取得できない場合がある
    // この場合はdocument.bodyから直接確認する
    await waitFor(() => {
      const drawer = document.body.querySelector('[role="dialog"]')
      expect(drawer).not.toBeInTheDocument()
    })
  },
}

export const ResponsiveLayout: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  args: {
    article: mockQiitaArticle,
  },
  play: async ({ canvas }) => {
    // モバイル表示でも要素が正しく表示されることを確認
    await expect(within(document.body).getByText(mockQiitaArticle.title)).toBeInTheDocument()
    await expect(within(document.body).getByRole('link', { name: '記事を読む' })).toBeInTheDocument()

    // ドロワーの幅クラスが適用されていることを確認
    const drawerContent = within(document.body).getByTestId('drawer-content')
    await expect(drawerContent).toBeInTheDocument()
    await expect(drawerContent).toHaveClass('w-1/2')

    // 高さが画面いっぱいになっていることを確認
    await expect(drawerContent).toHaveClass('h-full')
  },
}
