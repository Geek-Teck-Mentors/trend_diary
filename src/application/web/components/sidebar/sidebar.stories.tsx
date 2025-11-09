import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import { vi } from 'vitest'
import { SidebarProvider } from '../ui/sidebar'
import AppSidebar from './index'
import useSidebar from './use-sidebar'

// useSidebarフックをモック
vi.mock('./useSidebar', () => ({
  default: vi.fn(() => ({
    handleLogout: vi.fn(),
    isLoading: false,
  })),
}))

// デフォルトのuseSidebarモックを設定する関数
const setDefaultMock = () => {
  vi.mocked(useSidebar).mockReturnValue({
    handleLogout: vi.fn(),
    isLoading: false,
  })
}

const meta: Meta<typeof AppSidebar> = {
  component: AppSidebar,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    userFeatureEnabled: true,
  },
  decorators: [
    (Story) => (
      <SidebarProvider>
        <div style={{ height: '100vh', width: '300px' }}>
          <Story />
        </div>
      </SidebarProvider>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof AppSidebar>

export const Default: Story = {
  args: {
    displayName: '田中太郎',
  },
  beforeEach: setDefaultMock,
  play: async ({ canvas }) => {
    // サイドバーのヘッダー要素が存在することを確認
    await expect(canvas.getByText('TrendDiary')).toBeInTheDocument()

    // メニュー項目が表示されることを確認
    await expect(canvas.getByText('トレンド記事')).toBeInTheDocument()

    // ユーザー名が表示されることを確認
    await expect(canvas.getByText('ユーザー名：田中太郎')).toBeInTheDocument()

    // ログアウトボタンが表示されることを確認
    await expect(canvas.getByText('ログアウト')).toBeInTheDocument()
  },
}

export const LongDisplayName: Story = {
  args: {
    displayName: 'とても長いユーザー名のテストケースです',
  },
  beforeEach: setDefaultMock,
  play: async ({ canvas }) => {
    await expect(canvas.getByText('TrendDiary')).toBeInTheDocument()
    await expect(
      canvas.getByText('ユーザー名：とても長いユーザー名のテストケースです'),
    ).toBeInTheDocument()
  },
}

export const ShortDisplayName: Story = {
  args: {
    displayName: 'A',
  },
  beforeEach: setDefaultMock,
  play: async ({ canvas }) => {
    await expect(canvas.getByText('ユーザー名：A')).toBeInTheDocument()
  },
}

export const InteractiveLogout: Story = {
  args: {
    displayName: '山田花子',
  },
  beforeEach: setDefaultMock,
  play: async ({ canvas }) => {
    // ログアウトボタンをクリック
    const logoutButton = canvas.getByText('ログアウト')
    await expect(logoutButton).toBeInTheDocument()

    // ボタンがクリック可能であることを確認
    await userEvent.click(logoutButton)
  },
}

export const LoadingState: Story = {
  args: {
    displayName: '佐藤次郎',
  },
  beforeEach: () => {
    // ローディング状態のモックを設定
    vi.mocked(useSidebar).mockReturnValue({
      handleLogout: vi.fn(),
      isLoading: true,
    })
  },
  play: async ({ canvas }) => {
    // ローディング状態のテキストが表示されることを確認
    await expect(canvas.getByText('ログアウト中...')).toBeInTheDocument()

    // ボタンが無効化されていることを確認
    const logoutButton = canvas.getByText('ログアウト中...')
    await expect(logoutButton).toBeDisabled()
  },
}
