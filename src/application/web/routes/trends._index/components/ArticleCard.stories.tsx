import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor } from 'storybook/test'
import type { ArticleOutput as Article } from '@/domain/article/schema/articleSchema'
import ArticleCard from './ArticleCard'

const defaultMockArticle: Article = {
  articleId: BigInt(1),
  media: 'qiita',
  title: 'デフォルトタイトル',
  author: 'デフォルト筆者',
  description: 'デフォルトの説明文です',
  url: 'https://example.com',
  createdAt: new Date('2024-01-01T00:00:00Z'),
}

// モックのArticleデータ
const generateMockArticle = (params?: Partial<Article>): Article => ({
  ...defaultMockArticle,
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

const mockQiitaArticle = generateMockArticle({ media: 'qiita' })

export const QiitaArticle: Story = {
  args: {
    article: mockQiitaArticle,
  },
  play: async ({ canvas, args }) => {
    // クリック可能なArticleCard要素が存在することを確認
    const card = canvas.getByRole('button')
    await expect(card).toBeInTheDocument()

    // タイトルが表示されることを確認
    const titleContent = canvas.getByText(mockQiitaArticle.title)
    await expect(titleContent).toBeInTheDocument()

    // 著者名が表示されることを確認
    const author = canvas.getByText(mockQiitaArticle.author)
    await expect(author).toBeInTheDocument()

    // Qiitaメディアアイコンが表示されることを確認
    const mediaIcon = canvas.getByRole('img')
    await expect(mediaIcon).toBeInTheDocument()
    await expect(mediaIcon).toHaveAttribute('src', '/images/qiita-icon.png')
  },
}

const mockZennArticle = generateMockArticle({ media: 'zenn' })
export const ZennArticle: Story = {
  args: {
    article: mockZennArticle,
  },
  play: async ({ canvas }) => {
    // Zennメディアアイコンが表示されることを確認
    const mediaIcon = canvas.getByRole('img')
    await expect(mediaIcon).toBeInTheDocument()
    await expect(mediaIcon).toHaveAttribute('src', '/images/zenn-icon.svg')
  },
}

const mockLongTitleArticle = generateMockArticle({
  title: '非常に長いタイトルです'.repeat(10),
})
export const LongTitleArticle: Story = {
  args: {
    article: mockLongTitleArticle,
  },
  play: async ({ canvas }) => {
    // カード全体が表示されていることを確認
    const card = canvas.getByRole('button')
    await expect(card).toBeInTheDocument()
    await expect(card).toBeVisible()

    // タイトル要素を取得
    const titleElement = canvas.getByText(mockLongTitleArticle.title)
    await expect(titleElement).toBeInTheDocument()
    await expect(titleElement).toBeVisible()

    // タイトルが制限された高さ内に収まっていることを確認
    // line-clamp-2の効果で2行分の高さに制限されている
    const titleContainer = titleElement.closest('[class*="line-clamp-2"]')
    await expect(titleContainer).toBeInTheDocument()

    // タイトルコンテナの高さが合理的な範囲内であることを確認
    // (2行分のテキストの高さ程度)
    const containerRect = titleContainer!.getBoundingClientRect()
    await expect(containerRect.height).toBeGreaterThan(20) // 最低限の高さ
    await expect(containerRect.height).toBeLessThan(100) // 長すぎない高さ
  },
}

export const ClickInteraction: Story = {
  args: {
    article: mockQiitaArticle,
  },
  play: async ({ canvas, args }) => {
    // クリック可能なArticleCard要素を取得
    const card = canvas.getByRole('button')

    // カードをクリック
    await userEvent.click(card)

    // onCardClickが正しい引数で呼ばれることを確認
    await expect(args.onCardClick).toHaveBeenCalledWith(mockQiitaArticle)
    await expect(args.onCardClick).toHaveBeenCalledTimes(1)
  },
}

export const HoverInteraction: Story = {
  args: {
    article: mockQiitaArticle,
  },
  play: async ({ canvas }) => {
    // クリック可能なArticleCard要素を取得
    const card = canvas.getByRole('button')
    await expect(card).toBeVisible()

    // ホバー前の位置とサイズを記録
    const initialRect = card.getBoundingClientRect()
    const initialOpacity = window.getComputedStyle(card).opacity

    // ホバー効果をテスト
    await userEvent.hover(card)

    // トランジション効果が完了するまで待機
    await waitFor(() => {
      // ホバー状態が適用されるまで待機
      expect(card).toBeVisible()
    })

    // ホバー時にカードが正常に表示され続けていることを確認
    await expect(card).toBeVisible()

    // ホバー時の位置とサイズを確認（レイアウトが崩れていないこと）
    const hoveredRect = card.getBoundingClientRect()
    await expect(hoveredRect.width).toBeCloseTo(initialRect.width, 0)
    await expect(hoveredRect.height).toBeCloseTo(initialRect.height, 0)

    // ホバー時の透明度確認（表示されていること）
    const hoveredOpacity = window.getComputedStyle(card).opacity
    await expect(hoveredOpacity).toBe(initialOpacity)

    // ホバー解除
    await userEvent.unhover(card)

    // トランジション効果が完了するまで待機
    await waitFor(() => {
      // ホバー解除状態が適用されるまで待機
      expect(card).toBeVisible()
    })

    // ホバー解除後も正常に表示されることを確認
    await expect(card).toBeVisible()
    const finalRect = card.getBoundingClientRect()
    await expect(finalRect.width).toBeCloseTo(initialRect.width, 0)
    await expect(finalRect.height).toBeCloseTo(initialRect.height, 0)
  },
}
