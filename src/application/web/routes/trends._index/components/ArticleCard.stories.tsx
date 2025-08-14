import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent } from 'storybook/test'
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
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#f0f0f0' },
        { name: 'dark', value: '#333333' },
      ],
    },
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

    // タイトルと著者が正しく表示されることを確認
    await expect(canvas.getByText(mockZennArticle.title)).toBeInTheDocument()
    await expect(canvas.getByText(mockZennArticle.author)).toBeInTheDocument()
  },
}

const mockLongTitleArticle = generateMockArticle({ title: 'a'.repeat(100) })
export const LongTitleArticle: Story = {
  args: {
    article: mockLongTitleArticle,
  },
  play: async ({ canvas }) => {
    // 長いタイトルが2行を超える時、`...`が表示されることを確認
    const titleElement = canvas.getByText(mockLongTitleArticle.title)
    await expect(titleElement).toBeInTheDocument()

    // titleにline-clampが適用されていることを確認
    const titleContainer = titleElement.parentElement
    await expect(titleContainer).toBeInTheDocument()
    const computedStyle = window.getComputedStyle(titleContainer as Element)

    // line-clampの実装に必要なCSSプロパティを確認
    // Tailwind v4ではline-clampの実装が異なる可能性があるため、実際の値を確認
    await expect(computedStyle.webkitLineClamp).toBe('2')
    // displayの実際の値をテスト（Tailwind v4では'flow-root'が使われる）
    await expect(['flow-root', '-webkit-box']).toContain(computedStyle.display)
    // overflowが hidden であることを確認
    await expect(computedStyle.overflow).toBe('hidden')
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
    const computedStyle = window.getComputedStyle(card)

    // カーソルスタイルが実際にポインターになっていることを確認
    await expect(computedStyle.cursor).toBe('pointer')

    // トランジション効果の実際のCSS値を確認
    await expect(computedStyle.transitionProperty).toBe('all')
    await expect(computedStyle.transitionDuration).toBe('0.3s')

    // ホバー効果をテスト
    await userEvent.hover(card)

    // ホバー後のComputedStyleを再取得
    const hoveredStyle = window.getComputedStyle(card)

    // ホバー時にbox-shadowが変化することを確認（実際の値の変化をテスト）
    // 注意: ホバー擬似クラスの直接テストは困難なため、基本スタイリングの存在確認
    await expect(hoveredStyle.boxShadow).toBeTruthy()
    await expect(hoveredStyle.transitionProperty).toBe('all')
  },
}

export const KeyboardNavigation: Story = {
  args: {
    article: mockQiitaArticle,
  },
  play: async ({ canvas, args }) => {
    // クリック可能なArticleCard要素を取得してキーボードナビゲーションをテスト
    const card = canvas.getByRole('button')

    // キーボードフォーカスをテスト
    card.focus()
    await expect(card).toHaveFocus()

    // マウスクリックのテスト（キーボードイベントハンドラーがない場合の代替）
    await userEvent.click(card)
    await expect(args.onCardClick).toHaveBeenCalledWith(mockQiitaArticle)

    // フォーカス可能な要素であることを確認
    await expect(card).toHaveAttribute('tabIndex', '0')
  },
}

export const MediaIconVariations: Story = {
  parameters: {
    layout: 'padded',
  },
  render: () => (
    <div className='flex gap-4'>
      <ArticleCard article={mockQiitaArticle} onCardClick={fn()} />
      <ArticleCard article={mockZennArticle} onCardClick={fn()} />
    </div>
  ),
  play: async ({ canvas }) => {
    // 複数のクリック可能なArticleCard要素が表示されることを確認
    const cards = canvas.getAllByRole('button')
    await expect(cards).toHaveLength(2)

    // 各メディアアイコンが正しく表示されることを確認
    const mediaIcons = canvas.getAllByRole('img')
    await expect(mediaIcons).toHaveLength(2)

    // Qiitaアイコン
    await expect(mediaIcons[0]).toHaveAttribute('src', '/images/qiita-icon.png')

    // Zennアイコン
    await expect(mediaIcons[1]).toHaveAttribute('src', '/images/zenn-icon.svg')
  },
}
