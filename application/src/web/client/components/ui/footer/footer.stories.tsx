import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import Footer from './index'

const meta: Meta<typeof Footer> = {
  component: Footer,
  parameters: {
    layout: 'fullscreen',
  },
}
export default meta

type Story = StoryObj<typeof Footer>

export const Default: Story = {
  play: async ({ canvas }) => {
    // フッター要素が存在することを確認
    const footer = canvas.getByRole('contentinfo')
    await expect(footer).toBeInTheDocument()

    // ナビゲーションリンクが存在することを確認
    await expect(canvas.getByRole('link', { name: '利用規約' })).toBeInTheDocument()
    await expect(canvas.getByRole('link', { name: 'プライバシーポリシー' })).toBeInTheDocument()
    await expect(canvas.getByRole('link', { name: 'お問い合わせ' })).toBeInTheDocument()

    // コピーライト表記が存在することを確認
    await expect(canvas.getByText(/© 2025 TrendDiary/)).toBeInTheDocument()
    await expect(canvas.getByText(/技術トレンドを効率的に管理するツール/)).toBeInTheDocument()
  },
}

export const HoverInteraction: Story = {
  play: async ({ canvas }) => {
    // 各リンクのホバー動作を確認
    const linksToTest = ['利用規約', 'プライバシーポリシー', 'お問い合わせ']
    for (const name of linksToTest) {
      const link = canvas.getByRole('link', { name })
      await userEvent.hover(link)
      await expect(link).toHaveClass('hover:text-white')
      // 次の操作のためにホバーを解除
      await userEvent.unhover(link)
    }
  },
}

export const LinkValidation: Story = {
  play: async ({ canvas }) => {
    // リンクのhref属性が正しく設定されていることを確認
    const termsLink = canvas.getByRole('link', { name: '利用規約' })
    await expect(termsLink).toHaveAttribute('href', '/terms-of-service')

    const privacyLink = canvas.getByRole('link', { name: 'プライバシーポリシー' })
    await expect(privacyLink).toHaveAttribute('href', '/privacy-policy')

    const contactLink = canvas.getByRole('link', { name: 'お問い合わせ' })
    await expect(contactLink).toHaveAttribute('href', 'https://forms.gle/HgaE9qMXq6MJAxNG9')
  },
}

export const ResponsiveLayout: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  play: async ({ canvas }) => {
    // モバイル表示でも要素が正しく表示されることを確認
    await expect(canvas.getByRole('link', { name: '利用規約' })).toBeInTheDocument()
    await expect(canvas.getByRole('link', { name: 'プライバシーポリシー' })).toBeInTheDocument()
    await expect(canvas.getByRole('link', { name: 'お問い合わせ' })).toBeInTheDocument()

    // レスポンシブクラスが適用されていることを確認
    const container = canvas.getByRole('contentinfo').querySelector('.max-w-7xl')
    await expect(container).toBeInTheDocument()

    // フレックスボックスレイアウトクラスが適用されていることを確認
    const footer = canvas.getByRole('contentinfo')
    const navElement = footer.querySelector('nav')
    await expect(navElement).toBeInTheDocument()
    await expect(navElement).toHaveClass('flex-col', 'md:flex-row')
  },
}

export const DarkTheme: Story = {
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
  play: async ({ canvas }) => {
    // ダークテーマでのスタイリングが適用されていることを確認
    const footer = canvas.getByRole('contentinfo')
    await expect(footer).toHaveClass('bg-slate-900')

    // リンクにホバー効果が設定されていることを確認
    const termsLink = canvas.getByRole('link', { name: '利用規約' })
    await expect(termsLink).toHaveClass('hover:text-white')

    const privacyLink = canvas.getByRole('link', { name: 'プライバシーポリシー' })
    await expect(privacyLink).toHaveClass('hover:text-white')

    // コピーライトテキストの色が正しく設定されていることを確認
    const copyrightSection = footer.querySelector('.text-slate-400')
    await expect(copyrightSection).toBeInTheDocument()
  },
}
