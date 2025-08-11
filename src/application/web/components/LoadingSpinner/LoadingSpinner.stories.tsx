import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import LoadingSpinner from '.'

const meta: Meta<typeof LoadingSpinner> = {
  component: LoadingSpinner,
  parameters: {
    layout: 'fullscreen',
  },
}
export default meta

type Story = StoryObj<typeof LoadingSpinner>

export const Default: Story = {
  play: async ({ canvas }) => {
    // LoadingSpinnerのコンテナ要素をroleで取得
    const container = canvas.getByRole('status', { name: 'Loading...' })
    await expect(container).toBeInTheDocument()

    // fixed positionとinset-0クラスが適用されていることを確認
    await expect(container).toHaveClass('fixed')
    await expect(container).toHaveClass('inset-0')

    // フレックスボックスのセンタリングクラスが適用されていることを確認
    await expect(container).toHaveClass('flex')
    await expect(container).toHaveClass('items-center')
    await expect(container).toHaveClass('justify-center')

    // 背景スタイリングが適用されていることを確認
    await expect(container).toHaveClass('bg-gray-50')
    await expect(container).toHaveClass('bg-opacity-75')
    await expect(container).toHaveClass('backdrop-blur-sm')

    // スピナーコンポーネントが存在することを確認
    const spinner = container.querySelector('.animate-spin')
    await expect(spinner).toBeInTheDocument()
  },
}

export const SpinnerValidation: Story = {
  play: async ({ canvas }) => {
    // スピナーの基本スタイルが正しく適用されていることを確認
    const container = canvas.getByRole('status', { name: 'Loading...' })
    const spinner = container.querySelector('.animate-spin')
    await expect(spinner).toBeInTheDocument()

    // スピナーのサイズとボーダースタイルを確認
    await expect(spinner).toHaveClass('h-7')
    await expect(spinner).toHaveClass('w-7')
    await expect(spinner).toHaveClass('rounded-full')
    await expect(spinner).toHaveClass('border-[3px]')

    // スピナーの色クラスが適用されていることを確認
    await expect(spinner).toHaveClass('border-secondary')
    await expect(spinner).toHaveClass('border-t-primary')

    // アニメーションクラスが適用されていることを確認
    await expect(spinner).toHaveClass('animate-spin')
  },
}

export const OverlayProperties: Story = {
  play: async ({ canvas }) => {
    const container = canvas.getByRole('status', { name: 'Loading...' })

    // オーバーレイが全画面をカバーすることを確認
    await expect(container).toHaveClass('fixed')
    await expect(container).toHaveClass('inset-0')

    // 背景のブラー効果が適用されていることを確認
    await expect(container).toHaveClass('backdrop-blur-sm')

    // 背景色と透明度が正しく設定されていることを確認
    await expect(container).toHaveClass('bg-gray-50')
    await expect(container).toHaveClass('bg-opacity-75')

    // z-indexが設定されていないことを確認（必要に応じてスタイルを調整）
    const computedStyle = window.getComputedStyle(container as Element)
    const zIndex = computedStyle.zIndex
    // デフォルトでは特定のz-indexは設定されていない
    expect(['auto', '0', '']).toContain(zIndex)
  },
}

export const CenteringLayout: Story = {
  play: async ({ canvas }) => {
    const container = canvas.getByRole('status', { name: 'Loading...' })

    // フレックスボックスによる中央配置が正しく設定されていることを確認
    await expect(container).toHaveClass('flex')
    await expect(container).toHaveClass('items-center')
    await expect(container).toHaveClass('justify-center')

    // コンテナが全画面をカバーしていることを確認
    await expect(container).toHaveClass('fixed')
    await expect(container).toHaveClass('inset-0')

    // スピナーが中央に配置されていることを確認
    const spinner = container.querySelector('.animate-spin')
    await expect(spinner).toBeInTheDocument()
  },
}

export const ResponsiveLayout: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  play: async ({ canvas }) => {
    const container = canvas.getByRole('status', { name: 'Loading...' })

    // モバイル表示でも要素が正しく表示されることを確認
    await expect(container).toBeInTheDocument()
    await expect(container).toHaveClass('fixed')
    await expect(container).toHaveClass('inset-0')

    // スピナーがモバイルでも正しく表示されることを確認
    const spinner = container.querySelector('.animate-spin')
    await expect(spinner).toBeInTheDocument()
    await expect(spinner).toHaveClass('h-7')
    await expect(spinner).toHaveClass('w-7')

    // フレックスボックスレイアウトがモバイルでも機能することを確認
    await expect(container).toHaveClass('flex')
    await expect(container).toHaveClass('items-center')
    await expect(container).toHaveClass('justify-center')
  },
}

export const DarkTheme: Story = {
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
  play: async ({ canvas }) => {
    const container = canvas.getByRole('status', { name: 'Loading...' })

    // ダークテーマでも基本的なレイアウトが機能することを確認
    await expect(container).toBeInTheDocument()
    await expect(container).toHaveClass('fixed')
    await expect(container).toHaveClass('inset-0')

    // 背景色はグレーのまま（デザイン仕様に応じて調整可能）
    await expect(container).toHaveClass('bg-gray-50')
    await expect(container).toHaveClass('bg-opacity-75')

    // スピナーがダークテーマでも表示されることを確認
    const spinner = container.querySelector('.animate-spin')
    await expect(spinner).toBeInTheDocument()
    await expect(spinner).toHaveClass('animate-spin')

    // プライマリ・セカンダリカラーがダークテーマに対応していることを確認
    await expect(spinner).toHaveClass('border-secondary')
    await expect(spinner).toHaveClass('border-t-primary')
  },
}
