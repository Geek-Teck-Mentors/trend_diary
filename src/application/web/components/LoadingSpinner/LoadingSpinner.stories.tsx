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

    // 実際のCSSプロパティを確認
    const computedStyle = window.getComputedStyle(container as Element)

    // fixed positionが実際に適用されていることを確認
    await expect(computedStyle.position).toBe('fixed')

    // inset-0 (top, right, bottom, left: 0) が実際に適用されていることを確認
    await expect(computedStyle.top).toBe('0px')
    await expect(computedStyle.right).toBe('0px')
    await expect(computedStyle.bottom).toBe('0px')
    await expect(computedStyle.left).toBe('0px')

    // フレックスボックスのセンタリングが実際に適用されていることを確認
    await expect(computedStyle.display).toBe('flex')
    await expect(computedStyle.alignItems).toBe('center')
    await expect(computedStyle.justifyContent).toBe('center')

    // 背景色（bg-gray-50）が実際に適用されていることを確認
    // Tailwind bg-gray-50 は oklch(0.985 0.002 247.839)
    await expect(computedStyle.backgroundColor).toBe('oklch(0.985 0.002 247.839)')

    // backdrop-blur-smが実際に適用されていることを確認
    await expect(computedStyle.backdropFilter).toBe('blur(8px)')

    // スピナーコンポーネントが存在することを確認
    const spinner = container.querySelector('div > div')
    await expect(spinner).toBeInTheDocument()
  },
}
