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
    await expect(container).toBeVisible()

    // スピナーコンポーネントが存在し、表示されていることを確認
    const spinner = container.querySelector('div > div')
    await expect(spinner).toBeInTheDocument()
    await expect(spinner).toBeVisible()

    // スピナーのアニメーションが動作していることを確認
    const spinnerStyle = window.getComputedStyle(spinner as Element)
    await expect(spinnerStyle.animation).toContain('spin')
  },
}
