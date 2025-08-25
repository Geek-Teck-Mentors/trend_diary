import type { Meta, StoryObj } from '@storybook/react-vite'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { expect, userEvent } from 'storybook/test'
import Footer from './index'

const meta: Meta<typeof Footer> = {
  component: Footer,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => {
      const router = createMemoryRouter(
        [
          {
            path: '/',
            element: <Story />,
          },
          {
            path: '/login',
            element: <div>Login Page</div>,
          },
          {
            path: '/signup',
            element: <div>Signup Page</div>,
          },
        ],
        {
          initialEntries: ['/'],
        },
      )
      return <RouterProvider router={router} />
    },
  ],
}
export default meta

type Story = StoryObj<typeof Footer>

export const Default: Story = {
  play: async ({ canvas }) => {
    // フッター要素が存在することを確認
    const footer = canvas.getByRole('contentinfo')
    await expect(footer).toBeInTheDocument()

    // サイトタイトルが表示されることを確認
    await expect(canvas.getByText('TrendDiary')).toBeInTheDocument()

    // ロゴアイコンが存在することを確認（TrendingUpアイコン）
    const logo = footer.querySelector('.text-blue-400')
    await expect(logo).toBeInTheDocument()

    // ナビゲーションリンクが存在することを確認
    await expect(canvas.getByRole('link', { name: 'ログイン' })).toBeInTheDocument()
    await expect(canvas.getByRole('link', { name: 'アカウント作成' })).toBeInTheDocument()

    // コピーライト表記が存在することを確認
    await expect(canvas.getByText(/© 2025 TrendDiary/)).toBeInTheDocument()
    await expect(canvas.getByText(/技術トレンドを効率的に管理するツール/)).toBeInTheDocument()

    // TOPページへのリンクが存在することを確認
    const homeLink = canvas.getAllByRole('link').find((link) => link.getAttribute('href') === '/')
    await expect(homeLink).toBeInTheDocument()
  },
}

export const HoverInteraction: Story = {
  play: async ({ canvas }) => {
    // サイトロゴにホバーした時の動作を確認
    const homeLink = canvas.getAllByRole('link').find((link) => link.getAttribute('href') === '/')

    if (homeLink) {
      await userEvent.hover(homeLink)
      // ホバー効果が適用されることを確認（opacity変化）
      await expect(homeLink).toHaveClass('hover:opacity-80')
    }

    // ログインリンクにホバーした時の動作を確認
    const loginLink = canvas.getByRole('link', { name: 'ログイン' })
    await userEvent.hover(loginLink)
    await expect(loginLink).toHaveClass('hover:text-white')

    // アカウント作成リンクにホバーした時の動作を確認
    const signupLink = canvas.getByRole('link', { name: 'アカウント作成' })
    await userEvent.hover(signupLink)
    await expect(signupLink).toHaveClass('hover:text-white')
  },
}

export const LinkValidation: Story = {
  play: async ({ canvas }) => {
    // リンクのhref属性が正しく設定されていることを確認
    const homeLink = canvas.getAllByRole('link').find((link) => link.getAttribute('href') === '/')
    await expect(homeLink).toHaveAttribute('href', '/')

    const loginLink = canvas.getByRole('link', { name: 'ログイン' })
    await expect(loginLink).toHaveAttribute('href', '/login')

    const signupLink = canvas.getByRole('link', { name: 'アカウント作成' })
    await expect(signupLink).toHaveAttribute('href', '/signup')
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
    await expect(canvas.getByText('TrendDiary')).toBeInTheDocument()
    await expect(canvas.getByRole('link', { name: 'ログイン' })).toBeInTheDocument()
    await expect(canvas.getByRole('link', { name: 'アカウント作成' })).toBeInTheDocument()

    // レスポンシブクラスが適用されていることを確認
    const container = canvas.getByRole('contentinfo').querySelector('.max-w-7xl')
    await expect(container).toBeInTheDocument()

    // フレックスボックスレイアウトクラスが適用されていることを確認
    const flexContainer = canvas.getByRole('contentinfo').querySelector('.flex-col.md\\:flex-row')
    await expect(flexContainer).toBeInTheDocument()
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
    await expect(footer).toHaveClass('text-white')

    // リンクの色が正しく設定されていることを確認
    const loginLink = canvas.getByRole('link', { name: 'ログイン' })
    await expect(loginLink).toHaveClass('text-slate-300')

    const signupLink = canvas.getByRole('link', { name: 'アカウント作成' })
    await expect(signupLink).toHaveClass('text-slate-300')

    // コピーライトテキストの色が正しく設定されていることを確認
    const copyrightSection = footer.querySelector('.text-slate-400')
    await expect(copyrightSection).toBeInTheDocument()
  },
}
