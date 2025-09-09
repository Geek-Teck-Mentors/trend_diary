import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
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
  },
}

const zennMockArticle = generateMockArticle({ media: 'zenn' })

export const ZennArticle: Story = {
  args: {
    article: zennMockArticle,
  },
  play: async ({ canvas }) => {
    // Zennメディアアイコンが表示されることを確認
    const mediaIcon = within(document.body).getByAltText('zenn icon')
    await expect(mediaIcon).toBeInTheDocument()
  },
}

export const InteractionTest: Story = {
  args: {
    article: defaultMockArticle,
    onClose: fn(),
  },
  play: async ({ args, canvas }) => {
    // 閉じるボタンをクリックして動作を確認
    const closeButton = within(document.body).getByRole('button', { name: 'Close' })
    await userEvent.click(closeButton)

    // onCloseコールバックが呼び出されたことを確認
    await expect(args.onClose).toHaveBeenCalled()

    // 「記事を読む」ボタンにホバーした時の効果を確認
    const readButton = within(document.body).getByRole('link', { name: '記事を読む' })
    await userEvent.hover(readButton)
    await expect(readButton).toHaveClass('hover:bg-blue-600')

    // 外部リンクアイコンの存在確認
    const externalLinkIcon = readButton.querySelector('svg')
    await expect(externalLinkIcon).toBeInTheDocument()
  },
}

const longContentMockArticle = generateMockArticle({
  title: 'a'.repeat(100),
  description: 'b'.repeat(300),
  author: 'c'.repeat(50),
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
    await expect(within(document.body).getByText(longContentMockArticle.title)).toBeInTheDocument()

    // 長い作成者名が表示されることを確認
    await expect(within(document.body).getByText(longContentMockArticle.author)).toBeInTheDocument()
  },
}
