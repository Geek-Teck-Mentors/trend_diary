import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor, within } from 'storybook/test'
import type { ArticleOutput as Article } from '@/domain/article/schema/articleSchema'
import ArticleDrawer from './ArticleDrawer'

const defaultArticle: Article = {
  articleId: BigInt(1),
  media: 'qiita',
  title: 'デフォルトタイトル',
  author: 'デフォルト著者',
  description: 'デフォルトの説明文です',
  url: 'https://example.com',
  createdAt: new Date('2024-01-01T00:00:00Z'),
}

// モックのArticleデータ
const generateArticle = (params?: Partial<Article>): Article => ({
  ...defaultArticle,
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
    article: defaultArticle,
  },
  play: async ({ canvas }) => {
    // ドロワーが表示されることを確認（ポータル経由でdocument.bodyに描画される）
    await waitFor(() => {
      const drawer = within(document.body).getByRole('dialog', { hidden: true })
      expect(drawer).toBeInTheDocument()
    })

    // 記事タイトルが表示されることを確認
    await expect(within(document.body).getByText(defaultArticle.title)).toBeInTheDocument()

    // 作成者が表示されることを確認
    await expect(within(document.body).getByText(defaultArticle.author)).toBeInTheDocument()

    // 記事の説明が表示されることを確認
    await expect(
      within(document.body).getByText(defaultArticle.description),
    ).toBeInTheDocument()

    // 作成日が表示されることを確認（ローカライズされた形式）
    const formattedDate = defaultArticle.createdAt.toLocaleDateString()
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

const qiitaArticle = generateArticle({ media: 'qiita' })

export const QiitaArticle: Story = {
  args: {
    article: qiitaArticle,
  },
  play: async ({ canvas }) => {
    // Qiitaメディアアイコンが表示されることを確認
    const mediaIcon = within(document.body).getByAltText('qiita icon')
    await expect(mediaIcon).toBeInTheDocument()

    // 記事URLが正しく設定されていることを確認
    const readButton = within(document.body).getByRole('link', { name: '記事を読む' })
    await expect(readButton).toHaveAttribute('href', qiitaArticle.url)
  },
}

const zennArticle = generateArticle({ media: 'zenn' })

export const ZennArticle: Story = {
  args: {
    article: zennArticle,
  },
  play: async ({ canvas }) => {
    // Zennメディアアイコンが表示されることを確認
    const mediaIcon = within(document.body).getByAltText('zenn icon')
    await expect(mediaIcon).toBeInTheDocument()
  },
}
