import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor } from 'storybook/test'
import type { ArticleOutput as Article } from '@/domain/article/schema/articleSchema'
import ArticleCard from './ArticleCard'

const defaultArticle: Article = {
  articleId: BigInt(1),
  media: 'qiita',
  title: 'デフォルトタイトル',
  author: 'デフォルト筆者',
  description: 'デフォルトの説明文です',
  url: 'https://example.com',
  createdAt: new Date('2024-01-01T00:00:00Z'),
}

// モックのArticleデータ
const generateArticle = (params?: Partial<Article>): Article => ({
  ...defaultArticle,
  ...params,
})

const meta: Meta<typeof ArticleCard> = {
  component: ArticleCard,
  parameters: {
    layout: 'centered',
  },
  args: {
    onCardClick: fn(),
  },
}
export default meta

type Story = StoryObj<typeof ArticleCard>

const qiitaArticle = generateArticle({ media: 'qiita' })

export const QiitaArticle: Story = {
  args: {
    article: qiitaArticle,
  },
  play: async ({ canvas, step }) => {
    await step('クリック可能なArticleCard要素が存在することを確認', async () => {
      const card = canvas.getByRole('button')
      await expect(card).toBeInTheDocument()
    })

    await step('タイトルが表示されることを確認', async () => {
      const titleContent = canvas.getByText(qiitaArticle.title)
      await expect(titleContent).toBeInTheDocument()
    })

    await step('著者名が表示されることを確認', async () => {
      const author = canvas.getByText(qiitaArticle.author)
      await expect(author).toBeInTheDocument()
    })

    await step('Qiitaメディアアイコンが表示されることを確認', async () => {
      const mediaIcon = canvas.getByRole('img')
      await expect(mediaIcon).toBeInTheDocument()
      await expect(mediaIcon).toHaveAttribute('src', '/images/qiita-icon.png')
    })
  },
}

const zennArticle = generateArticle({ media: 'zenn' })
export const ZennArticle: Story = {
  args: {
    article: zennArticle,
  },
  play: async ({ canvas, step }) => {
    await step('Zennメディアアイコンが表示されることを確認', async () => {
      const mediaIcon = canvas.getByRole('img')
      await expect(mediaIcon).toBeInTheDocument()
      await expect(mediaIcon).toHaveAttribute('src', '/images/zenn-icon.svg')
    })
  },
}

export const ClickInteraction: Story = {
  args: {
    article: qiitaArticle,
  },
  play: async ({ canvas, args, step }) => {
    // クリック可能なArticleCard要素を取得
    const card = canvas.getByRole('button')
    await userEvent.click(card)

    await step('onCardClickが正しい引数で呼ばれることを確認', async () => {
      await expect(args.onCardClick).toHaveBeenCalledWith(qiitaArticle)
      await expect(args.onCardClick).toHaveBeenCalledTimes(1)
    })
  },
}

export const HoverInteraction: Story = {
  args: {
    article: qiitaArticle,
  },
  play: async ({ canvas, step }) => {
    // クリック可能なArticleCard要素を取得
    const card = canvas.getByRole('button')

    await step('ArticleCardの存在の確認', async () => {
      await expect(card).toBeVisible()
    })

    await step('ホバー時にカードが表示され続けていることを確認', async () => {
      await userEvent.hover(card)
      await waitFor(() => {
        // ホバー状態が適用されるまで待機
        expect(card).toBeVisible()
      })

      await expect(card).toBeVisible()
    })

    await step('ホバー解除時にカードが表示され続けていることを確認', async () => {
      await userEvent.hover(card)
      // ホバー解除
      await userEvent.unhover(card)

      // トランジション効果が完了するまで待機
      await waitFor(() => {
        // ホバー解除状態が適用されるまで待機
        expect(card).toBeVisible()
      })

      await expect(card).toBeVisible()
    })
  },
}
