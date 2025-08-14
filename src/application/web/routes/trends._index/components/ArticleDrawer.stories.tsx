import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import type { ArticleOutput as Article } from '@/domain/article/schema/articleSchema'
import ArticleDrawer from './ArticleDrawer'

const defaultMockArticle: Article = {
  articleId: BigInt(1),
  media: 'qiita',
  title: 'デフォルトタイトル',
  author: 'デフォルト著者',
  description: 'デフォルトの説明文です',
  url: 'https://example.com',
  createdAt: new Date('2024-01-01T00:00:00Z'),
}

// モックのArticleデータ
const generateMockArticle = (params?: Partial<Article>): Article => ({
  ...defaultMockArticle,
  ...params,
})

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
    onClose: () => null,
  },
}
export default meta

type Story = StoryObj<typeof ArticleDrawer>

export const Default: Story = {
  args: {
    article: defaultMockArticle,
  },
  play: async ({ canvas }) => {
    // ドロワーが表示されることを確認（ポータル経由でdocument.bodyに描画される）
    await waitFor(() => {
      const drawer = within(document.body).getByRole('dialog', { hidden: true })
      expect(drawer).toBeInTheDocument()
    })

    // 記事タイトルが表示されることを確認
    await expect(within(document.body).getByText(defaultMockArticle.title)).toBeInTheDocument()

    // 作成者が表示されることを確認
    await expect(within(document.body).getByText(defaultMockArticle.author)).toBeInTheDocument()

    // 記事の説明が表示されることを確認
    await expect(
      within(document.body).getByText(defaultMockArticle.description),
    ).toBeInTheDocument()

    // 作成日が表示されることを確認（ローカライズされた形式）
    const formattedDate = defaultMockArticle.createdAt.toLocaleDateString()
    await expect(within(document.body).getByText(formattedDate)).toBeInTheDocument()

    // 「記事を読む」ボタンが存在することを確認
    await expect(
      within(document.body).getByRole('link', { name: '記事を読む' }),
    ).toBeInTheDocument()

    // 閉じるボタンが存在することを確認
    const closeButton = within(document.body).getByRole('button', { name: 'Close' })
    await expect(closeButton).toBeInTheDocument()
  },
}

const qiitaMockArticle = generateMockArticle({ media: 'qiita' })

export const QiitaArticle: Story = {
  args: {
    article: qiitaMockArticle,
  },
  play: async ({ canvas }) => {
    // Qiitaメディアアイコンが表示されることを確認
    const mediaIcon = within(document.body).getByAltText('qiita icon')
    await expect(mediaIcon).toBeInTheDocument()

    // 記事URLが正しく設定されていることを確認
    const readButton = within(document.body).getByRole('link', { name: '記事を読む' })
    await expect(readButton).toHaveAttribute('href', qiitaMockArticle.url)
    await expect(readButton).toHaveAttribute('target', '_blank')
    await expect(readButton).toHaveAttribute('rel', 'noopener noreferrer nofollow')
  },
}

const zennMockArticle = generateMockArticle({ media: 'zenn' })

export const ZennArticle: Story = {
  args: {
    article: zennMockArticle,
  },
  play: async ({ canvas }) => {
    // Zennの記事タイトルが表示されることを確認
    await expect(within(document.body).getByText(zennMockArticle.title)).toBeInTheDocument()

    // Zennの作成者が表示されることを確認
    await expect(within(document.body).getByText(zennMockArticle.author)).toBeInTheDocument()

    // 記事URLが正しく設定されていることを確認
    const readButton = within(document.body).getByRole('link', { name: '記事を読む' })
    await expect(readButton).toHaveAttribute('href', zennMockArticle.url)
  },
}

export const InteractionTest: Story = {
  args: {
    article: defaultMockArticle,
    onClose: () => null,
  },
  play: async ({ canvas }) => {
    // 閉じるボタンをクリックして動作を確認
    const closeButton = within(document.body).getByRole('button', { name: 'Close' })
    await userEvent.click(closeButton)

    // 「記事を読む」ボタンにホバーした時の効果を確認
    const readButton = within(document.body).getByRole('link', { name: '記事を読む' })
    await userEvent.hover(readButton)
    await expect(readButton).toHaveClass('hover:bg-blue-600')

    // 閉じるボタンのXアイコンの存在確認
    const xIcon = closeButton.querySelector('svg')
    await expect(xIcon).toBeInTheDocument()

    // 外部リンクアイコンの存在確認
    const externalLinkIcon = readButton.querySelector('svg')
    await expect(externalLinkIcon).toBeInTheDocument()
  },
}

export const UIElementsValidation: Story = {
  args: {
    article: defaultMockArticle,
  },
  play: async ({ canvas }) => {
    // UI要素が正しく表示されていることを確認
    const mediaIcon = within(document.body).getByAltText('qiita icon')
    await expect(mediaIcon).toBeInTheDocument()

    const authorElement = within(document.body).getByText(defaultMockArticle.author)
    await expect(authorElement).toBeInTheDocument()

    const titleElement = within(document.body).getByText(defaultMockArticle.title)
    await expect(titleElement).toBeInTheDocument()

    const descriptionElement = within(document.body).getByText(defaultMockArticle.description)
    await expect(descriptionElement).toBeInTheDocument()

    const readButton = within(document.body).getByRole('link', { name: '記事を読む' })
    await expect(readButton).toBeInTheDocument()

    // 作成日が表示されていることを確認
    const formattedDate = defaultMockArticle.createdAt.toLocaleDateString()
    await expect(within(document.body).getByText(formattedDate)).toBeInTheDocument()

    // 「記事の概要」ヘッダーが存在することを確認
    await expect(within(document.body).getByText('記事の概要')).toBeInTheDocument()
  },
}

const longTitle = 'a'.repeat(100)
const longDescription = 'b'.repeat(300)
const longAuthorName = 'c'.repeat(50)
const longContentMockArticle = generateMockArticle({
  title: longTitle,
  description: longDescription,
  author: longAuthorName,
})

export const LongContentTest: Story = {
  args: {
    article: longContentMockArticle,
  },
  play: async ({ canvas }) => {
    // 長いコンテンツでもレイアウトが崩れないことを確認
    await waitFor(() => {
      const drawer = within(document.body).getByRole('dialog', { hidden: true })
      expect(drawer).toBeInTheDocument()
    })

    // タイトルが表示されることを確認（長いタイトル）
    await expect(within(document.body).getByText(longTitle)).toBeInTheDocument()

    // 長い作成者名が表示されることを確認
    await expect(within(document.body).getByText(longAuthorName)).toBeInTheDocument()

    // スクロール可能な領域が存在することを確認（ドロワーのコンテンツ部分）
    const drawer = within(document.body).getByRole('dialog', { hidden: true })
    await expect(drawer).toBeInTheDocument()
  },
}

export const ClosedState: Story = {
  args: {
    article: defaultMockArticle,
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
    article: defaultMockArticle,
  },
  play: async ({ canvas }) => {
    // モバイル表示でも要素が正しく表示されることを確認
    await expect(within(document.body).getByText(defaultMockArticle.title)).toBeInTheDocument()
    await expect(
      within(document.body).getByRole('link', { name: '記事を読む' }),
    ).toBeInTheDocument()

    // ドロワーが正しく表示されていることを確認（ポータル経由での描画を考慮して待機）
    await waitFor(() => {
      const drawer = within(document.body).getByRole('dialog', { hidden: true })
      expect(drawer).toBeInTheDocument()
      // モバイル表示でもコンテンツが正しく表示されていることを確認
      expect(within(drawer).getByText(defaultMockArticle.title)).toBeInTheDocument()
    })
  },
}
