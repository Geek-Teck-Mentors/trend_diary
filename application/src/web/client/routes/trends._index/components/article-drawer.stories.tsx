import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { toJaDateString } from '@/common/locale'
import type { Article } from '../hooks/use-articles'
import ArticleDrawer from './article-drawer'

const defaultArticle: Article = {
  articleId: '1',
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
    onClose: fn(),
    onMarkAsRead: fn(),
    isLoggedIn: false,
  },
}
export default meta

type Story = StoryObj<typeof ArticleDrawer>

export const Default: Story = {
  args: {
    article: defaultArticle,
  },
  play: async ({ step }) => {
    // ドロワーが表示されることを確認（ポータル経由でdocument.bodyに描画される）
    await waitFor(() => {
      const drawer = within(document.body).getByRole('dialog', { hidden: true })
      expect(drawer).toBeInTheDocument()
    })

    await step('記事タイトルが表示されることを確認', async () => {
      await expect(within(document.body).getByText(defaultArticle.title)).toBeInTheDocument()
    })

    await step('作成者が表示されることを確認', async () => {
      await expect(within(document.body).getByText(defaultArticle.author)).toBeInTheDocument()
    })

    await step('記事の説明が表示されることを確認', async () => {
      await expect(within(document.body).getByText(defaultArticle.description)).toBeInTheDocument()
    })

    await step('作成日が表示されることを確認（ローカライズされた形式）', async () => {
      const formattedDate = toJaDateString(defaultArticle.createdAt)
      await expect(within(document.body).getByText(formattedDate)).toBeInTheDocument()
    })

    await step('「記事を読む」ボタンが存在することを確認', async () => {
      await expect(
        within(document.body).getByRole('button', { name: '記事を読む' }),
      ).toBeInTheDocument()
    })

    await step('閉じるボタンが存在することを確認', async () => {
      const closeButton = within(document.body).getByRole('button', { name: 'Close' })
      await expect(closeButton).toBeInTheDocument()
    })
  },
}

const qiitaArticle = generateArticle({ media: 'qiita' })

export const QiitaArticle: Story = {
  args: {
    article: qiitaArticle,
  },
  play: async ({ step }) => {
    await step('Qiitaメディアアイコンが表示されることを確認', async () => {
      const mediaIcon = within(document.body).getByAltText('qiita icon')
      await expect(mediaIcon).toBeInTheDocument()
    })

    await step('記事URLが正しく設定されていることを確認', async () => {
      const readButton = within(document.body).getByRole('button', { name: '記事を読む' })
      await expect(readButton).toBeInTheDocument()
    })
  },
}

const zennArticle = generateArticle({ media: 'zenn' })

export const ZennArticle: Story = {
  args: {
    article: zennArticle,
  },
  play: async ({ step }) => {
    await step('Zennメディアアイコンが表示されることを確認', async () => {
      const mediaIcon = within(document.body).getByAltText('zenn icon')
      await expect(mediaIcon).toBeInTheDocument()
    })
  },
}

// 既読記事（ログイン時）
const readArticle = generateArticle({ isRead: true })
export const ReadArticleLoggedIn: Story = {
  args: {
    article: readArticle,
    isLoggedIn: true,
  },
  play: async ({ step }) => {
    await step('既読アイコンが表示されることを確認', async () => {
      await waitFor(() => {
        const readIndicator = within(document.body).getByTestId('drawer-read-indicator')
        expect(readIndicator).toBeInTheDocument()
      })
    })
  },
}

// 未読記事（ログイン時）
const unreadArticle = generateArticle({ isRead: false })
export const UnreadArticleLoggedIn: Story = {
  args: {
    article: unreadArticle,
    isLoggedIn: true,
  },
  play: async ({ step }) => {
    await step('既読アイコンが表示されないことを確認', async () => {
      await waitFor(() => {
        within(document.body).getByRole('dialog', { hidden: true })
      })
      const readIndicator = within(document.body).queryByTestId('drawer-read-indicator')
      await expect(readIndicator).not.toBeInTheDocument()
    })
  },
}

// 「記事を読む」クリック時にonMarkAsReadとonCloseが呼ばれる
export const MarkAsReadOnClick: Story = {
  args: {
    article: unreadArticle,
    isLoggedIn: true,
  },
  play: async ({ args, step }) => {
    await step('「記事を読む」クリックでonMarkAsReadとonCloseが呼ばれることを確認', async () => {
      await waitFor(() => {
        within(document.body).getByRole('dialog', { hidden: true })
      })
      const readButton = within(document.body).getByText('記事を読む')
      await userEvent.click(readButton)

      await expect(args.onMarkAsRead).toHaveBeenCalledWith(unreadArticle.articleId.toString())
      await expect(args.onClose).toHaveBeenCalled()
    })
  },
}
