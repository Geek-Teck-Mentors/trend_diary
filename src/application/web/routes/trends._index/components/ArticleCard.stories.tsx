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
    // カード要素が存在することを確認
    const card = canvas.getByRole('button')
    await expect(card).toBeInTheDocument()

    // タイトルが表示されることを確認
    const titleContent = canvas.getByText(mockQiitaArticle.title)
    await expect(titleContent).toBeInTheDocument()

    // 著者名が表示されることを確認
    const author = canvas.getByText(mockQiitaArticle.author)
    await expect(author).toBeInTheDocument()

    // Qiitaメディアアイコンが表示されることを確認
    const mediaIcon = canvas.getByTestId('media-icon')
    await expect(mediaIcon).toBeInTheDocument()
    await expect(mediaIcon).toHaveAttribute('src', '/images/qiita-icon.png')

    // アクセシビリティ属性が正しく設定されていることを確認
    await expect(card).toHaveAttribute('role', 'button')
    await expect(card).toHaveAttribute('tabIndex', '0')
  },
}

const mockZennArticle = generateMockArticle({ media: 'zenn' })
export const ZennArticle: Story = {
  args: {
    article: mockZennArticle,
  },
  play: async ({ canvas }) => {
    // Zennメディアアイコンが表示されることを確認
    const mediaIcon = canvas.getByTestId('media-icon')
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
    // 長いタイトルが適切に表示されることを確認（line-clampが適用される）
    const titleElement = canvas.getByText(mockLongTitleArticle.title)
    await expect(titleElement).toBeInTheDocument()

    // line-clampクラスが適用されていることを確認
    const titleContainer = titleElement.closest('.line-clamp-2')
    await expect(titleContainer).toBeInTheDocument()
  },
}

export const ClickInteraction: Story = {
  args: {
    article: mockQiitaArticle,
  },
  play: async ({ canvas, args }) => {
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
    const card = canvas.getByRole('button')

    // ホバー効果をテスト
    await userEvent.hover(card)

    // カードがcursor-pointerクラスを持つことを確認
    await expect(card).toHaveClass('cursor-pointer')

    // transition-allクラスが適用されていることを確認（ホバーアニメーション用）
    await expect(card).toHaveClass('transition-all')
    await expect(card).toHaveClass('duration-300')

    // ホバー時のshadow効果クラスが設定されていることを確認
    await expect(card).toHaveClass('hover:shadow-xl')
  },
}

export const KeyboardNavigation: Story = {
  args: {
    article: mockQiitaArticle,
  },
  play: async ({ canvas, args }) => {
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

export const AccessibilityTest: Story = {
  args: {
    article: mockQiitaArticle,
  },
  play: async ({ canvas }) => {
    const card = canvas.getByRole('button')

    // role属性が正しく設定されていることを確認
    await expect(card).toHaveAttribute('role', 'button')

    // tabIndex属性が正しく設定されていることを確認
    await expect(card).toHaveAttribute('tabIndex', '0')

    // カード内の要素が適切にマークアップされていることを確認
    const titleSlot = canvas.getByText(mockQiitaArticle.title)
    await expect(titleSlot).toHaveAttribute('data-slot', 'card-title-content')

    const authorSlot = canvas.getByText(mockQiitaArticle.author)
    await expect(authorSlot).toHaveAttribute('data-slot', 'card-description-author')
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
    // 複数のカードが表示されることを確認
    const cards = canvas.getAllByRole('button')
    await expect(cards).toHaveLength(2)

    // 各メディアアイコンが正しく表示されることを確認
    const mediaIcons = canvas.getAllByTestId('media-icon')
    await expect(mediaIcons).toHaveLength(2)

    // Qiitaアイコン
    await expect(mediaIcons[0]).toHaveAttribute('src', '/images/qiita-icon.png')

    // Zennアイコン
    await expect(mediaIcons[1]).toHaveAttribute('src', '/images/zenn-icon.svg')
  },
}

export const ResponsiveLayout: Story = {
  args: {
    article: mockQiitaArticle,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  play: async ({ canvas }) => {
    // モバイル表示でもカードが正しく表示されることを確認
    const card = canvas.getByRole('button')
    await expect(card).toBeInTheDocument()

    // 固定サイズクラスが適用されていることを確認
    await expect(card).toHaveClass('h-32', 'w-64')

    // テキストが適切に表示されることを確認
    await expect(canvas.getByText(mockQiitaArticle.title)).toBeInTheDocument()
    await expect(canvas.getByText(mockQiitaArticle.author)).toBeInTheDocument()
  },
}
